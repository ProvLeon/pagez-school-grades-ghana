import { supabase } from '@/integrations/supabase/client';
import { OrganizationBilling } from '@/types/billing';

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
      .select('id, name, subscription_status, declared_seat_count, trial_ends_at, current_subscription_ends_at')
      .eq('id', userOrg.organization_id)
      .single();

    if (error) {
      console.error('Error fetching billing details:', error);
      return null;
    }

    return data as OrganizationBilling;
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

  async initializePayment(email: string, amountGHS: number, organizationId: string, reference: string, onSuccess: () => void) {
    try {
      const PaystackPop = await this.loadPaystack();
      
      // Paystack amount is always the lowest currency unit (pesewas)
      const amountInPesewas = amountGHS * 100;
      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

      if (!publicKey) {
        console.error("VITE_PAYSTACK_PUBLIC_KEY is not set.");
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
          organization_id: organizationId, // For the webhook to know which tenant to upgrade
          custom_fields: [
            {
              display_name: "Organization ID",
              variable_name: "organization_id",
              value: organizationId
            }
          ]
        },
        callback: function(response: any) {
          console.log("Paystack payment success. Reference:", response.reference);
          // Webhook handles actual verification and DB updating, but frontend can refresh optimistically
          onSuccess();
        },
        onClose: function() {
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
