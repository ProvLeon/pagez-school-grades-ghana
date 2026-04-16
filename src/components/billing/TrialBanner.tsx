import React from 'react';
import { useBilling } from '@/hooks/useBilling';
import { AlertCircle, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TrialBanner = () => {
  const { billing, studentCount, loading, initiatePayment } = useBilling();

  if (loading || !billing) return null;

  const { subscription_status, declared_seat_count, trial_ends_at } = billing;

  if (subscription_status !== 'trial') {
    return null; // Don't show trial banners for active or expired accounts
  }

  // Calculate days left in trial
  const daysLeft = trial_ends_at ? Math.ceil((new Date(trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  // Calculate seat usage percentage
  const seatUsagePercentage = (studentCount / declared_seat_count) * 100;
  
  const isSeatLimitClose = seatUsagePercentage >= 80;
  const isTrialEndingSoon = daysLeft <= 2 && daysLeft > 0;
  const amountToPay = declared_seat_count * 2.00;

  if (isSeatLimitClose || isTrialEndingSoon || daysLeft <= 0) {
    return (
      <div className={`w-full px-4 py-3 text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-3 shadow-md z-40 transition-all ${isSeatLimitClose || daysLeft <= 0 ? 'bg-destructive/10 text-destructive border-b border-destructive/20' : 'bg-orange-500/10 text-orange-600 border-b border-orange-500/20'}`}>
        
        <div className="flex items-center gap-2 text-center sm:text-left">
          {isSeatLimitClose ? <Users className="w-5 h-5 flex-shrink-0" /> : <Clock className="w-5 h-5 flex-shrink-0" />}
          
          {daysLeft <= 0 ? (
            <span>Your 14-day free trial ends today. Subscribe to ensure no interruption.</span>
          ) : isTrialEndingSoon ? (
            <span>Your free trial ends in <b>{daysLeft} days</b>. Subscribe now to ensure uninterrupted access.</span>
          ) : isSeatLimitClose ? (
            <span><b>Seat Limit Approaching:</b> You have used {studentCount} of your {declared_seat_count} allocated trial seats.</span>
          ) : null}
        </div>

        <Button 
          size="sm" 
          variant={isSeatLimitClose || daysLeft <= 0 ? "destructive" : "default"}
          className={`h-8 px-4 ${!isSeatLimitClose && daysLeft > 0 ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
          onClick={() => initiatePayment(amountToPay)}
        >
          Subscribe Now
        </Button>
      </div>
    );
  }

  return null;
};
