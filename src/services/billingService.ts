import { supabase } from '@/integrations/supabase/client';
import { OrganizationBilling } from '@/types/billing';

// ─── Billing Constants ─────────────────────────────────────────────────────────
export const TRIAL_SEAT_CAP = 10;
export const PER_SEAT_RATE = 2.00;   // GHS per student per year
export const MINIMUM_ANNUAL_FEE = 200;  // GHS — minimum regardless of seat count

export function calcAnnualFee(seats: number): number {
  return Math.max(MINIMUM_ANNUAL_FEE, Math.round(seats * PER_SEAT_RATE * 100) / 100);
}

/** Top-up fee: no minimum applied — user already paid it at initial subscription. */
export function calcTopUpFee(additionalSeats: number): number {
  return Math.round(additionalSeats * PER_SEAT_RATE * 100) / 100;
}

export const billingService = {
  async fetchBillingDetails(): Promise<OrganizationBilling | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get org id
    const { data: userOrg } = await supabase
      .from('user_organization_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!userOrg?.organization_id) return null;

    const { data, error } = await supabase
      .from('organizations')
      .select('id, name, subscription_status, declared_seat_count, trial_ends_at, current_subscription_ends_at, billing_enabled')
      .eq('id', userOrg.organization_id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching billing details:', error);
      return null;
    }

    return data as OrganizationBilling | null;
  },

  async getStudentCount(orgId: string): Promise<number> {
    const { count, error } = await supabase
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', orgId);

    if (error) {
      console.error('Error getting student count:', error);
      return 0;
    }
    return count || 0;
  },

  async toggleBillingEnabled(orgId: string, enabled: boolean): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('toggle_organization_billing', {
          org_id: orgId,
          enabled: enabled
        });

      if (error) {
        console.error('Error toggling billing status:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error('Failed to toggle billing:', err);
      return false;
    }
  },

  async updateBillingEnabledDirect(orgId: string, enabled: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ billing_enabled: enabled })
        .eq('id', orgId);

      if (error) {
        console.error('Error updating billing status:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Failed to update billing status:', err);
      return false;
    }
  },

  async loadPaystack(): Promise<any> {
    return new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) {
        resolve((window as any).PaystackPop);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve((window as any).PaystackPop);
      script.onerror = () => reject(new Error('Paystack inline script failed to load.'));
      document.body.appendChild(script);
    });
  },

  async updateDeclaredSeats(orgId: string, seats: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ declared_seat_count: seats })
        .eq('id', orgId);
      if (error) {
        console.error('Error updating declared seats:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Failed to update declared seats:', err);
      return false;
    }
  },

  async verifyAndActivate(
    reference: string,
    organizationId: string,
    seatCount?: number,
  ): Promise<{ success: boolean; billing?: unknown }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !anonKey) {
        console.error('[verifyAndActivate] Supabase env vars not set.');
        return { success: false };
      }

      // Tell the Edge Function which Paystack environment this payment was made in
      // so it uses the matching secret key for verification.
      const isTest = import.meta.env.VITE_PAYSTACK_ENV !== 'live';

      const resp = await fetch(
        `${supabaseUrl}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
          },
          body: JSON.stringify({
            reference,
            organization_id: organizationId,
            seat_count: seatCount,
            is_test: isTest,
          }),
        }
      );

      const result = await resp.json();

      if (!resp.ok) {
        console.error('[verifyAndActivate] Edge Function error:', result);
        return { success: false };
      }

      console.log('[verifyAndActivate] Subscription activated:', result);
      return { success: true, billing: result.billing };
    } catch (err) {
      console.error('[verifyAndActivate] Failed:', err);
      return { success: false };
    }
  },

  async initializePayment(
    email: string,
    amountGHS: number,
    organizationId: string,
    reference: string,
    onSuccess: () => void,
    seatCount?: number,
  ) {
    try {
      const PaystackPop = await this.loadPaystack();

      // Paystack amount is always the lowest currency unit (pesewas)
      const amountInPesewas = amountGHS * 100;
      const isLive = import.meta.env.VITE_PAYSTACK_ENV === 'live';
      const publicKey = isLive
        ? import.meta.env.VITE_PAYSTACK_PUBLIC_KEY_LIVE
        : import.meta.env.VITE_PAYSTACK_PUBLIC_KEY_TEST;

      if (!publicKey) {
        console.error(
          isLive
            ? "VITE_PAYSTACK_PUBLIC_KEY_LIVE is not set."
            : "VITE_PAYSTACK_PUBLIC_KEY_TEST is not set."
        );
        alert("Payment configuration error. Please contact support.");
        return;
      }

      const handler = PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: amountInPesewas,
        currency: "GHS",
        ref: reference,
        metadata: {
          organization_id: organizationId,
          custom_fields: [
            {
              display_name: "Organization ID",
              variable_name: "organization_id",
              value: organizationId,
            },
            ...(seatCount !== undefined ? [{
              display_name: "Seat Count",
              variable_name: "seat_count",
              value: String(seatCount),
            }] : []),
          ],
        },
        callback: function (response: any) {
          console.log("Paystack payment success. Reference:", response.reference);
          // Call verify-payment Edge Function immediately — verifies with Paystack
          // API server-side using the correct key (test vs live) and activates the
          // subscription in the DB right away. No webhook dependency.
          billingService
            .verifyAndActivate(response.reference, organizationId, seatCount)
            .then(({ success }) => {
              if (success) {
                onSuccess();
              } else {
                // Verification failed — surface it rather than silently refreshing
                console.error(
                  '[billingService] verifyAndActivate failed for ref:',
                  response.reference
                );
                // Still call onSuccess so the UI at least refreshes;
                // the admin can retry if the status hasn't changed.
                onSuccess();
              }
            })
            .catch((err) => {
              console.error('[billingService] Unexpected error in verifyAndActivate:', err);
              onSuccess();
            });
        },
        onClose: function () {
          console.log("Paystack window closed by user.");
        }
      });

      handler.openIframe();
    } catch (err) {
      console.error("Payment initialization failed:", err);
      alert("Failed to load Paystack payment gateway.");
    }
  }
};
