import React, { useState, useEffect } from 'react';
import { useBilling } from '@/hooks/useBilling';
import { Sparkles, Calendar, Users, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TrialBanner = () => {
  const { billing, studentCount, loading, initiatePayment, isBillingEnabled } = useBilling();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Determine if we should show the banner in this session
    // It will pop up once per session (every time they log in) until dismissed
    const isDismissed = sessionStorage.getItem('trial_banner_dismissed');
    if (!isDismissed) {
      // Small delay so it pops up after the dashboard loads
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('trial_banner_dismissed', 'true');
  };

  if (loading || !billing || !isBillingEnabled || !isVisible) return null;

  const { subscription_status, declared_seat_count, trial_ends_at } = billing;

  if (subscription_status !== 'trial') {
    return null; // Don't show trial banners for active or expired accounts
  }

  // Calculate days left in trial
  const daysLeft = trial_ends_at ? Math.ceil((new Date(trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Calculate seat usage
  const seatUsagePercentage = (studentCount / declared_seat_count) * 100;
  const isSeatLimitClose = seatUsagePercentage >= 80;
  const amountToPay = declared_seat_count * 2.00;

  // Determine urgency level
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 2 || isSeatLimitClose;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className={`relative overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 ${
          isExpired || isUrgent 
            ? 'bg-gradient-to-br from-white to-red-50 border-red-200/60 shadow-red-500/10' 
            : 'bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] border-blue-400/50 shadow-blue-500/20 text-white'
        }`}
      >
        {/* Background Decorative Elements */}
        {!(isExpired || isUrgent) && (
          <>
            <div className="absolute top-0 right-0 w-[200px] h-full bg-gradient-to-l from-white/10 to-transparent skew-x-12 translate-x-10" />
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </>
        )}

        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className={`absolute top-3 right-3 p-1 rounded-md transition-colors z-20 ${
            isExpired || isUrgent ? 'text-red-400 hover:bg-red-100 hover:text-red-600' : 'text-blue-200 hover:bg-white/10 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="relative z-10 flex flex-col gap-4 p-5">
          
          {/* Top Section: Icon & Header */}
          <div className="flex items-start gap-3 w-full">
            {/* Icon Box */}
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner mt-1 ${
                isExpired || isUrgent 
                  ? 'bg-red-100 text-red-600 border border-red-200' 
                  : 'bg-white/10 backdrop-blur-md shadow-black/20 text-white'
              }`}>
              {isExpired || isUrgent ? <Users className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>

            {/* Messaging */}
            <div className="space-y-1 pr-6">
              <h3 className={`text-base font-bold tracking-tight flex flex-wrap items-center gap-1.5 leading-tight ${
                  isExpired || isUrgent ? 'text-red-900' : 'text-white'
                }`}>
                {isExpired ? (
                  "Free Trial Expired"
                ) : isUrgent ? (
                  "Trial Ending Soon"
                ) : (
                  "14-Day Premium Trial"
                )}
                {!(isExpired || isUrgent) && (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-[1px] rounded bg-blue-400/30 text-blue-50 border border-blue-400/50">
                    <ShieldCheck className="w-2.5 h-2.5" /> Pro
                  </span>
                )}
              </h3>
              
              <p className={`text-[13px] leading-relaxed ${isExpired || isUrgent ? 'text-red-700/90' : 'text-blue-100'}`}>
                {isExpired ? (
                  <span>Subscribe to restore access to reports for <b>{declared_seat_count} students</b>.</span>
                ) : isSeatLimitClose ? (
                  <span>You've used <b>{studentCount}</b> of <b>{declared_seat_count}</b> trial seats. Upgrade early.</span>
                ) : (
                  <span>Full access to grading tools for up to <b>{declared_seat_count} students</b>.</span>
                )}
              </p>
            </div>
          </div>

          {/* Bottom Section: Action & Countdown */}
          <div className={`flex items-center justify-between gap-3 pt-3 border-t ${isExpired || isUrgent ? 'border-red-100' : 'border-blue-400/30'}`}>
            {/* Countdown Badge */}
            {!isExpired ? (
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${
                isUrgent ? 'bg-orange-100 text-orange-700' : 'bg-black/10 text-white/90'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
              </div>
            ) : <div />}

            {/* CTA Button */}
            <Button
              size="sm"
              className={`h-8 px-4 text-xs font-bold shadow-md transition-all ${
                  isExpired || isUrgent 
                    ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/25 text-white' 
                    : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-black/10 hover:-translate-y-0.5'
                }`}
              onClick={() => initiatePayment(amountToPay)}
            >
              Subscribe Now
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
};
