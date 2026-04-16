import { useState, useEffect } from 'react';
import { billingService } from '@/services/billingService';
import { OrganizationBilling } from '@/types/billing';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useBilling = () => {
  const [user, setUser] = useState<User | null>(null);
  const [billing, setBilling] = useState<OrganizationBilling | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const data = await billingService.fetchBillingDetails();
      setBilling(data);
      if (data) {
        const count = await billingService.getStudentCount(data.id);
        setStudentCount(count);
      }
    } catch (err) {
      console.error("Failed to load billing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBilling();
    } else {
      setBilling(null);
      setLoading(false);
    }
  }, [user]);

  const initiatePayment = async (amountGHS: number) => {
    if (!billing || !user) {
      toast({ title: "Error", description: "Cannot initiate payment. Missing user or organization info.", variant: "destructive" });
      return;
    }

    const reference = `REF_${Date.now()}_${billing.id.substring(0, 8)}`;
    
    await billingService.initializePayment(user.email || 'admin@school.com', amountGHS, billing.id, reference, () => {
      toast({ title: "Payment Successful", description: "Your payment was processed. Your account status should update shortly." });
      // Optimistically reload billing
      setTimeout(fetchBilling, 2000); // Small delay to allow webhook processing
    });
  };

  return {
    billing,
    studentCount,
    loading,
    refreshBilling: fetchBilling,
    initiatePayment
  };
};
