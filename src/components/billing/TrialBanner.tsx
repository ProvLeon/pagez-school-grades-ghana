import React, { useState, useEffect } from 'react';
import { useBilling } from '@/hooks/useBilling';
import { TRIAL_SEAT_CAP } from '@/services/billingService';
import { Sparkles, Calendar, Users, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TrialBanner = () => {
  const { billing, studentCount, loading, initiatePayment, isBillingEnabled, effectiveSeatCap } = useBilling();
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

  // Calculate days left in trial (14-day trial)
  const daysLeft = trial_ends_at
    ? Math.ceil((new Date(trial_ends_at).getTime() - Date.now()) / 86_400_000)
    : 0;

  // During trial the effective cap is 10 students
  const trialCap = effectiveSeatCap ?? TRIAL_SEAT_CAP;
  const seatUsagePercentage = (studentCount / trialCap) * 100;
  const isSeatLimitClose = seatUsagePercentage >= 80;

  // Default subscribe seats = declared_seat_count (school's intended allocation)
  const subscribeSeats = Math.max(declared_seat_count, studentCount, TRIAL_SEAT_CAP);

  // Determine urgency level
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 2 || isSeatLimitClose;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[420px] animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div className={`relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${isExpired || isUrgent
          ? 'bg-orange-500/10 border-orange-500/20 shadow-orange-500/10'
          : 'bg-slate-900/85 border-slate-700/50 shadow-black/40 text-white'
        }`}
      >
        {/* Background Decorative Elements */}
        {!(isExpired || isUrgent) && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent mix-blend-overlay pointer-events-none" />
            <div className="absolute top-0 right-0 w-[200px] h-full bg-gradient-to-l from-white/5 to-transparent skew-x-12 translate-x-10 pointer-events-none" />
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className={`absolute top-3 right-3 p-1 rounded-full transition-colors z-20 ${isExpired || isUrgent ? 'text-red-400 hover:bg-red-100 hover:text-red-600' : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 flex flex-col gap-4 p-5">

          {/* Top Section: Icon & Header */}
          <div className="flex items-start gap-3 w-full">
            {/* Icon Box */}
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner mt-1 ${isExpired || isUrgent
                ? 'bg-red-100 text-red-600 border border-red-200'
                : 'bg-white/10 border border-white/10 shadow-black/20 text-white'
              }`}>
              {isExpired || isUrgent ? <Users className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>

            {/* Messaging */}
            <div className="space-y-1 pr-6">
              <h3 className={`text-base font-bold tracking-tight flex flex-wrap items-center gap-1.5 leading-tight ${isExpired || isUrgent ? 'text-red-900' : 'text-white'
                }`}>
                {isExpired
                  ? 'Free Trial Expired'
                  : isUrgent
                    ? 'Trial Ending Soon'
                    : '14-Day Free Trial'}
                {!(isExpired || isUrgent) && (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold tracking-wider px-1.5 py-[1px] rounded bg-white/10 text-slate-200 border border-white/10">
                    <ShieldCheck className="w-2.5 h-2.5" /> Pro
                  </span>
                )}
              </h3>

              <p className={`text-[13px] leading-relaxed ${isExpired || isUrgent ? 'text-red-700/90' : 'text-slate-300'}`}>
                {isExpired ? (
                  <span>Subscribe to restore full access. Your data is safe and waiting.</span>
                ) : isSeatLimitClose ? (
                  <span>You've used <b>{studentCount}</b> of <b>{trialCap}</b> trial seats. Subscribe to increase your cap.</span>
                ) : (
                  <span>Full access during your trial — up to <b className="text-white">{trialCap} students</b>.</span>
                )}
              </p>
            </div>
          </div>

          {/* Bottom Section: Action & Countdown */}
          <div className={`flex items-center justify-between gap-3 pt-3 border-t ${isExpired || isUrgent ? 'border-red-100' : 'border-white/10'}`}>
            {/* Countdown Badge */}
            {!isExpired ? (
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md ${isUrgent ? 'bg-orange-100 text-orange-700' : 'bg-white/5 text-slate-300 border border-white/5'
                }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
              </div>
            ) : <div />}

            {/* CTA Button */}
            <Button
              size="sm"
              className={`h-8 px-4 text-xs font-bold shadow-md transition-all ${isExpired || isUrgent
                  ? 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/25 text-white'
                  : 'bg-white text-slate-900 hover:bg-slate-100 shadow-black/20 hover:-translate-y-0.5'
                }`}
              onClick={() => initiatePayment(subscribeSeats)}
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
