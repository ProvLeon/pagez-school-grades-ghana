import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  Users,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import { useAuth } from '@/contexts/AuthContext';
import { TRIAL_SEAT_CAP, calcAnnualFee } from '@/services/billingService';
import { SubscriptionStatus } from '@/types/billing';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const TRIAL_DURATION_DAYS = 14;
const PER_SEAT_RATE = 2.0;
const MINIMUM_FEE = 200;

// ─── Status Config ────────────────────────────────────────────────────────────
type StatusCfg = {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  Icon: React.FC<{ className?: string }>;
  headline: string;
  description: string;
};

const STATUS_CONFIG: Record<SubscriptionStatus, StatusCfg> = {
  trial: {
    label: 'Free Trial',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    Icon: Sparkles,
    headline: '14-Day Free Trial',
    description:
      'You have full access to all platform features during your free trial. No payment is required yet — subscribe any time to lock in your seat count.',
  },
  active: {
    label: 'Active',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    Icon: CheckCircle2,
    headline: 'Subscription Active',
    description:
      'Your school has an active subscription with full access to all features. Your seat quota is enforced.',
  },
  trial_expired: {
    label: 'Trial Expired',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    Icon: AlertTriangle,
    headline: 'Free Trial Ended',
    description:
      'Your 14-day trial has ended. You can still view and download your existing data, but all write actions are paused until you subscribe.',
  },
  grace: {
    label: 'Grace Period',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    Icon: Clock,
    headline: 'Grace Period Active',
    description:
      'Your subscription has expired. You have a 7-day grace window to renew before your account is fully locked. Your data is safe.',
  },
  locked: {
    label: 'Account Locked',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    Icon: XCircle,
    headline: 'Account Locked',
    description:
      'Your account is locked due to non-payment. All your data is preserved and will be immediately accessible once you subscribe.',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysRemaining(iso: string): number {
  return Math.max(
    0,
    Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
  );
}

function trialProgress(trialEndsAt: string): number {
  const end = new Date(trialEndsAt).getTime();
  const start = end - TRIAL_DURATION_DAYS * 86_400_000;
  const now = Date.now();
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}

// ─── Component ────────────────────────────────────────────────────────────────
export const BillingAdminSettings: React.FC = () => {
  const {
    billing,
    studentCount,
    loading,
    initiatePayment,
    isBillingEnabled,
    togglingBilling,
    toggleBillingEnabled,
    effectiveSeatCap,
    isSeatCapReached,
    isSeatWarning,
  } = useBilling();

  const { user } = useAuth();

  const isSuperAdmin = user?.email === 'admin@example.com';

  const [seatInput, setSeatInput] = useState<number | ''>('');
  const [paying, setPaying] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Once billing loads, seed the seat input with the org's current declared count
  useEffect(() => {
    if (billing && seatInput === '') {
      setSeatInput(
        Math.max(
          billing.declared_seat_count,
          TRIAL_SEAT_CAP
        )
      );
    }
  }, [billing]);
  const [adminConfirmAction, setAdminConfirmAction] = useState<
    'enable' | 'disable' | null
  >(null);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  // ── No billing data ──────────────────────────────────────────────────────
  if (!billing) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
          <Info className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">Billing information is not available yet.</p>
          <p className="text-xs mt-1 opacity-70">
            Please contact support if this persists.
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    subscription_status,
    declared_seat_count,
    trial_ends_at,
    current_subscription_ends_at,
  } = billing;

  const cfg = STATUS_CONFIG[subscription_status];
  const StatusIcon = cfg.Icon;

  // Trial days left
  const trialDaysLeft = trial_ends_at ? daysRemaining(trial_ends_at) : 0;
  const trialPct = trial_ends_at ? trialProgress(trial_ends_at) : 0;

  // Seat usage
  const seatUsagePct = Math.min(
    100,
    Math.round((studentCount / effectiveSeatCap) * 100)
  );

  // Seat input — default to max of current declared count, student count, or 10
  const defaultSeats = Math.max(declared_seat_count, studentCount, TRIAL_SEAT_CAP);
  const resolvedSeats = seatInput === '' ? defaultSeats : (seatInput as number);
  const seatsValid = (resolvedSeats as number) >= TRIAL_SEAT_CAP;
  const annualFee = calcAnnualFee(resolvedSeats as number);
  const isMinimumApplied =
    (resolvedSeats as number) * PER_SEAT_RATE < MINIMUM_FEE;

  // CTA labels
  const isExpiredOrLocked = ['trial_expired', 'grace', 'locked'].includes(
    subscription_status
  );
  const isActiveSubscription = subscription_status === 'active';

  const ctaLabel = isActiveSubscription
    ? `Renew for Next Year — GHS ${annualFee.toFixed(2)}`
    : `Activate Subscription — GHS ${annualFee.toFixed(2)}`;

  const handlePayment = async () => {
    if (paying) return;
    setPaying(true);
    try {
      await initiatePayment(resolvedSeats as number);
    } finally {
      setPaying(false);
    }
  };

  const handleAdminToggle = async () => {
    if (!adminConfirmAction) return;
    await toggleBillingEnabled(adminConfirmAction === 'enable');
    setAdminConfirmAction(null);
  };

  return (
    <div className="space-y-5">

      {/* ── 1. Status Card ──────────────────────────────────────────────── */}
      <Card className={cn('border', cfg.borderColor)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={cn('p-2.5 rounded-xl', cfg.bgColor)}>
                <StatusIcon className={cn('w-5 h-5', cfg.textColor)} />
              </div>
              <div>
                <CardTitle className="text-base leading-tight">
                  {cfg.headline}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {billing.name}
                </CardDescription>
              </div>
            </div>
            <Badge
              className={cn(
                'text-xs font-semibold border shrink-0',
                cfg.bgColor,
                cfg.textColor,
                cfg.borderColor
              )}
            >
              {cfg.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {cfg.description}
          </p>

          {/* Trial countdown */}
          {subscription_status === 'trial' && trial_ends_at && (
            <div
              className={cn(
                'p-3 rounded-lg border space-y-2',
                trialDaysLeft <= 3
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-blue-50 border-blue-100'
              )}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    className={cn(
                      'w-4 h-4 shrink-0',
                      trialDaysLeft <= 3 ? 'text-orange-600' : 'text-blue-600'
                    )}
                  />
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      trialDaysLeft <= 3 ? 'text-orange-800' : 'text-blue-800'
                    )}
                  >
                    {trialDaysLeft > 0
                      ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} remaining`
                      : 'Trial ends today'}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    trialDaysLeft <= 3
                      ? 'bg-orange-200 text-orange-800'
                      : 'bg-blue-100 text-blue-700'
                  )}
                >
                  Ends {formatDate(trial_ends_at)}
                </span>
              </div>
              <Progress
                value={trialPct}
                className={cn(
                  'h-1.5',
                  trialDaysLeft <= 3 ? '[&>div]:bg-orange-500' : '[&>div]:bg-blue-500'
                )}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round(trialPct)}% of your trial period used ·{' '}
                {TRIAL_DURATION_DAYS}-day free trial
              </p>
            </div>
          )}

          {/* Active subscription info */}
          {subscription_status === 'active' && current_subscription_ends_at && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Full access active
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Valid until{' '}
                  {formatDate(current_subscription_ends_at)} ·{' '}
                  {daysRemaining(current_subscription_ends_at)} days remaining
                </p>
              </div>
            </div>
          )}

          {/* Expired / grace / locked notice */}
          {isExpiredOrLocked && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">
                {subscription_status === 'grace'
                  ? `Grace period — ${current_subscription_ends_at ? daysRemaining(current_subscription_ends_at) + ' days' : 'limited time'} left to renew before account locks.`
                  : 'Your data is fully preserved. Subscribing below will restore access immediately.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 2. Seat Usage Card ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Student Seats</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-black text-foreground">
                {studentCount}
              </span>
              <span className="text-muted-foreground text-sm ml-1.5 font-medium">
                of {effectiveSeatCap} seats used
              </span>
            </div>
            <span
              className={cn(
                'text-sm font-bold',
                isSeatCapReached
                  ? 'text-red-600'
                  : isSeatWarning
                    ? 'text-amber-600'
                    : 'text-muted-foreground'
              )}
            >
              {seatUsagePct}%
            </span>
          </div>

          <Progress
            value={seatUsagePct}
            className={cn(
              'h-2',
              isSeatCapReached
                ? '[&>div]:bg-red-500'
                : isSeatWarning
                  ? '[&>div]:bg-amber-500'
                  : '[&>div]:bg-blue-500'
            )}
          />

          {subscription_status === 'trial' && (
            <p className="text-xs text-muted-foreground">
              Trial limit: {TRIAL_SEAT_CAP} students. Subscribe to increase your
              seat count.
            </p>
          )}

          {isSeatCapReached && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs text-red-800 font-medium">
                Seat limit reached — subscribe below to increase your quota.
              </p>
            </div>
          )}

          {!isSeatCapReached && isSeatWarning && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                Approaching seat limit — consider subscribing with additional
                capacity.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── 3. Subscribe / Renew Card ───────────────────────────────────── */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">
              {isActiveSubscription
                ? 'Manage Subscription'
                : subscription_status === 'trial'
                  ? 'Subscribe Early'
                  : 'Activate Subscription'}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {isActiveSubscription
              ? 'Renew early or adjust your seat count for the next year.'
              : 'Choose your seat count, review the fee, and pay securely via Paystack.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Seat count selector */}
          <div className="space-y-2">
            <Label
              htmlFor="seat-count"
              className="text-sm font-medium"
            >
              How many students will you register this year?
            </Label>
            <Input
              id="seat-count"
              type="number"
              min={TRIAL_SEAT_CAP}
              step={10}
              value={seatInput}
              onChange={(e) => {
                // Allow free typing — do NOT clamp on every keystroke
                // (clamping mid-type prevents entering multi-digit numbers)
                if (e.target.value === '') {
                  setSeatInput('');
                } else {
                  const v = parseInt(e.target.value, 10);
                  setSeatInput(isNaN(v) ? '' : v);
                }
              }}
              onBlur={() => {
                // Enforce minimum only when the field loses focus
                if (seatInput === '' || (seatInput as number) < TRIAL_SEAT_CAP) {
                  setSeatInput(TRIAL_SEAT_CAP);
                }
              }}
              className="max-w-xs text-base font-semibold"
            />
            {!seatsValid && seatInput !== '' && (
              <p className="text-xs text-red-600 font-medium">
                Minimum {TRIAL_SEAT_CAP} seats required.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              This becomes your hard registration ceiling for the subscription
              year. Minimum {TRIAL_SEAT_CAP} seats.
            </p>
          </div>

          {/* Fee calculator */}
          <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-muted-foreground font-medium">
                Annual fee
              </span>
              <span className="text-2xl font-black text-foreground">
                GHS {annualFee.toFixed(2)}
              </span>
            </div>

            <Separator />

            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>
                  {resolvedSeats} student{(resolvedSeats as number) !== 1 ? 's' : ''} × GHS{' '}
                  {PER_SEAT_RATE.toFixed(2)}
                </span>
                <span className="font-medium text-foreground">
                  GHS {((resolvedSeats as number) * PER_SEAT_RATE).toFixed(2)}
                </span>
              </div>
              {isMinimumApplied && (
                <div className="flex justify-between text-amber-700 font-medium">
                  <span>Minimum annual fee applies</span>
                  <span>GHS {MINIMUM_FEE.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-foreground border-t pt-1.5 mt-1">
                <span>Total due today</span>
                <span>GHS {annualFee.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              GHS 2.00 per student · GHS 200 minimum · billed annually ·
              subscriptions run January 1 – December 31
            </p>
          </div>

          {/* CTA button */}
          {isBillingEnabled ? (
            <Button
              className={cn(
                'w-full font-bold h-11 text-sm gap-2',
                isActiveSubscription ? 'variant-outline' : ''
              )}
              variant={isActiveSubscription ? 'outline' : 'default'}
              disabled={paying || !isBillingEnabled || !seatsValid}
              onClick={handlePayment}
            >
              {paying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Opening payment gateway…
                </>
              ) : (
                <>
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border text-sm text-muted-foreground">
              <Lock className="w-4 h-4 shrink-0" />
              Billing is currently disabled by the platform administrator.
            </div>
          )}

          {/* Payment methods */}
          <div className="flex flex-col items-center gap-3 pt-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
              Secure payments via Paystack
            </p>
            <div className="flex items-center gap-5 flex-wrap justify-center">
              <img
                src="/images/payment/momo_mtnb.png"
                alt="MTN Mobile Money"
                className="h-6 object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
              <div className="w-px h-5 bg-border" />
              <img
                src="/images/payment/telecel-cash.webp"
                alt="Telecel Cash"
                className="h-6 object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
              <div className="w-px h-5 bg-border" />
              <img
                src="/images/payment/ATM-Logo-01.png"
                alt="Visa / Mastercard"
                className="h-5 object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              All subscriptions run <strong>January 1 – December 31</strong>.
              Your declared seat count becomes a hard ceiling — you cannot enrol
              more students than the seats you have paid for. You can top up
              mid-year if needed.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Platform Admin Controls (super-admin only) ───────────────── */}
      {isSuperAdmin && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2">
            <button
              type="button"
              onClick={() => setShowAdminPanel((p) => !p)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm text-amber-800">
                  Platform Admin Controls
                </CardTitle>
              </div>
              {showAdminPanel ? (
                <ChevronUp className="w-4 h-4 text-amber-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-amber-600" />
              )}
            </button>
          </CardHeader>

          {showAdminPanel && (
            <CardContent className="space-y-4 pt-0">
              <p className="text-xs text-amber-700">
                This panel is only visible to the platform super-administrator.
                Use it to enable or disable billing enforcement for this
                organisation.
              </p>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-200">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Billing enforcement
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isBillingEnabled
                      ? 'Trial banners and seat limits are active.'
                      : 'All billing UI is hidden; seat limits bypassed.'}
                  </p>
                </div>
                <Badge
                  className={cn(
                    'shrink-0 ml-3',
                    isBillingEnabled
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  )}
                >
                  {isBillingEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>

              <AlertDialog
                open={!!adminConfirmAction}
                onOpenChange={(open) => !open && setAdminConfirmAction(null)}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant={isBillingEnabled ? 'destructive' : 'default'}
                    size="sm"
                    disabled={togglingBilling}
                    onClick={() =>
                      setAdminConfirmAction(
                        isBillingEnabled ? 'disable' : 'enable'
                      )
                    }
                    className="w-full"
                  >
                    {togglingBilling
                      ? 'Updating…'
                      : isBillingEnabled
                        ? 'Disable Billing'
                        : 'Enable Billing'}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {adminConfirmAction === 'disable'
                        ? 'Disable Billing?'
                        : 'Enable Billing?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div className="space-y-2 text-sm">
                        {adminConfirmAction === 'disable' ? (
                          <ul className="list-disc list-inside space-y-1">
                            <li>Trial banners and overlays will be hidden</li>
                            <li>Seat limit enforcement will be bypassed</li>
                            <li>Users cannot initiate payments</li>
                            <li>
                              Active subscriptions remain until their end date
                            </li>
                          </ul>
                        ) : (
                          <ul className="list-disc list-inside space-y-1">
                            <li>
                              Trial banners and overlays will be displayed
                            </li>
                            <li>Seat limit enforcement will be active</li>
                            <li>Payment features will be available</li>
                          </ul>
                        )}
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex gap-3 justify-end pt-2">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleAdminToggle}
                      disabled={togglingBilling}
                      className={
                        adminConfirmAction === 'disable'
                          ? 'bg-red-600 hover:bg-red-700'
                          : ''
                      }
                    >
                      {togglingBilling ? 'Updating…' : 'Confirm'}
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
