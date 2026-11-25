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

  async startHostedCheckout(organizationId: string, seatCount: number, idempotencyKey: string): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!session?.access_token || !supabaseUrl) {
      console.error('[startHostedCheckout] Missing session or VITE_SUPABASE_URL');
      return null;
    }
    const response = await fetch(`${supabaseUrl}/functions/v1/initialize-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ organization_id: organizationId, seat_count: seatCount, idempotency_key: idempotencyKey }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || typeof result?.authorization_url !== 'string') {
      console.error('[startHostedCheckout] Edge function error:', result);
      return null;
    }
    return result.authorization_url;
  },

  

  async verifyAndActivate(
    reference: string,
    _organizationId?: string,
    _seatCount?: number,
  ): Promise<{ success: boolean; billing?: unknown }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        console.error('[verifyAndActivate] Supabase env vars not set.');
        return { success: false };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return { success: false };

      const resp = await fetch(
        `${supabaseUrl}/functions/v1/verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ reference }),
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

};
