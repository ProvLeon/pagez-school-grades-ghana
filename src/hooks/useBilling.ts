import { useState, useEffect } from 'react';
import { billingService, TRIAL_SEAT_CAP, calcAnnualFee } from '@/services/billingService';
import { OrganizationBilling } from '@/types/billing';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useBilling = () => {
  const [user, setUser] = useState<User | null>(null);
  const [billing, setBilling] = useState<OrganizationBilling | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingBilling, setTogglingBilling] = useState<boolean>(false);
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

  // ─── Seat Cap Logic ──────────────────────────────────────────────────────────
  // During trial: hard cap of 10 students regardless of declared_seat_count.
  // After subscribing: cap is the declared_seat_count the school paid for.
  const effectiveSeatCap: number =
    billing?.subscription_status === 'trial'
      ? TRIAL_SEAT_CAP
      : (billing?.declared_seat_count ?? TRIAL_SEAT_CAP);

  const isSeatCapReached = studentCount >= effectiveSeatCap;
  const isSeatWarning = !isSeatCapReached && studentCount >= Math.floor(effectiveSeatCap * 0.8);

  // ─── Payment ──────────────────────────────────────────────────────────────────
  /**
   * Launch the Paystack checkout.
   *
   * @param seatCount   Number of seats the school is paying for.
   *                    If omitted, falls back to `declared_seat_count`.
   * @param amountGHS   Override the calculated fee (optional — normally derived
   *                    from seatCount via calcAnnualFee).
   */
  const initiatePayment = async (seatCount?: number, amountGHS?: number) => {
    if (!billing || !user) {
      toast({
        title: "Error",
        description: "Cannot initiate payment. Missing user or organisation info.",
        variant: "destructive",
      });
      return;
    }

    if (!billing.billing_enabled) {
      toast({
        title: "Billing Disabled",
        description: "Billing has been disabled for this organisation by the administrator.",
        variant: "destructive",
      });
      return;
    }

    // Resolve seats to charge for
    const seats = seatCount ?? billing.declared_seat_count;
    const fee = amountGHS ?? calcAnnualFee(seats);

    // Persist the declared seat count BEFORE opening Paystack so the webhook
    // can read the correct value if it fires before the frontend updates.
    if (seatCount !== undefined && seatCount !== billing.declared_seat_count) {
      await billingService.updateDeclaredSeats(billing.id, seats);
      // Optimistically update local state so the UI reflects the new cap immediately
      setBilling(prev =>
        prev ? { ...prev, declared_seat_count: seats } : null
      );
    }

    const reference = `REF_${Date.now()}_${billing.id.substring(0, 8)}`;

    await billingService.initializePayment(
      user.email ?? 'admin@school.com',
      fee,
      billing.id,
      reference,
      () => {
        toast({
          title: "Payment Successful",
          description: "Your payment was processed. Your account status will update shortly.",
        });
        // Small delay to allow the webhook to fire before we re-fetch
        setTimeout(fetchBilling, 2500);
      },
      seats,
    );
  };

  // ─── Admin toggle ────────────────────────────────────────────────────────────
  const toggleBillingEnabled = async (enabled: boolean) => {
    if (!billing) {
      toast({
        title: "Error",
        description: "Cannot toggle billing without organisation info.",
        variant: "destructive",
      });
      return;
    }

    try {
      setTogglingBilling(true);

      const success = await billingService.toggleBillingEnabled(billing.id, enabled);

      if (success) {
        setBilling(prev => prev ? { ...prev, billing_enabled: enabled } : null);
        toast({
          title: "Success",
          description: `Billing has been ${enabled ? 'enabled' : 'disabled'} for your organisation.`,
        });
        await fetchBilling();
      } else {
        toast({
          title: "Error",
          description: "Failed to update billing status. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error toggling billing:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating billing status.",
        variant: "destructive",
      });
    } finally {
      setTogglingBilling(false);
    }
  };

  return {
    billing,
    studentCount,
    loading,
    togglingBilling,
    refreshBilling: fetchBilling,
    initiatePayment,
    toggleBillingEnabled,
    isBillingEnabled: billing?.billing_enabled ?? true,
    effectiveSeatCap,
    isSeatCapReached,
    isSeatWarning,
  };
};
