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
  Lock,
  RefreshCw,
  CreditCard,
  Plus,
  Minus,
} from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import { useAuth } from '@/contexts/AuthContext';
import { TRIAL_SEAT_CAP, calcAnnualFee } from '@/services/billingService';
import { SubscriptionStatus } from '@/types/billing';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────
const TRIAL_DURATION_DAYS = 14;
const PER_SEAT_RATE = 2.0;
const MINIMUM_FEE = 200;
// The seat count at which per-seat cost naturally equals the minimum fee (200 ÷ 2 = 100)
const MIN_ECONOMIC_SEATS = Math.ceil(MINIMUM_FEE / PER_SEAT_RATE);

// ─── Status Config ────────────────────────────────────────────────────────────
type StatusCfg = {
  label: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  gradientClasses: string;
  ringColor: string;
  pillClasses: string;
  Icon: React.FC<{ className?: string }>;
  headline: string;
  description: string;
};

const STATUS_CONFIG: Record<SubscriptionStatus, StatusCfg> = {
  trial: {
    label: 'Free Trial',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradientClasses: 'from-blue-50/90 via-indigo-50/60 to-sky-50/40 border-blue-200/70',
    ringColor: '#3B82F6',
    pillClasses: 'bg-blue-100 text-blue-700',
    Icon: Sparkles,
    headline: '14-Day Free Trial',
    description:
      'Full access to all platform features. No payment required yet — subscribe any time to lock in your seat count and remove the trial cap.',
  },
  active: {
    label: 'Active',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    gradientClasses: 'from-emerald-50/90 via-green-50/60 to-teal-50/40 border-emerald-200/70',
    ringColor: '#10B981',
    pillClasses: 'bg-emerald-100 text-emerald-700',
    Icon: CheckCircle2,
    headline: 'Subscription Active',
    description:
      'Your school has full access to all features. Your declared seat quota is enforced and write actions are fully enabled.',
  },
  trial_expired: {
    label: 'Trial Expired',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    gradientClasses: 'from-amber-50/90 via-orange-50/60 to-yellow-50/40 border-amber-200/70',
    ringColor: '#F59E0B',
    pillClasses: 'bg-amber-100 text-amber-700',
    Icon: AlertTriangle,
    headline: 'Free Trial Ended',
    description:
      'Your 14-day trial has ended. You can still view and download existing data, but all write actions are paused until you subscribe.',
  },
  grace: {
    label: 'Grace Period',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    gradientClasses: 'from-amber-50/90 via-yellow-50/60 to-orange-50/40 border-amber-200/70',
    ringColor: '#D97706',
    pillClasses: 'bg-amber-100 text-amber-800',
    Icon: Clock,
    headline: 'Grace Period Active',
    description:
      'Your subscription has expired. You have a 7-day grace window to renew before your account is fully locked. Your data is safe.',
  },
  locked: {
    label: 'Account Locked',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    gradientClasses: 'from-red-50/90 via-rose-50/60 to-pink-50/40 border-red-200/70',
    ringColor: '#EF4444',
    pillClasses: 'bg-red-100 text-red-700',
    Icon: XCircle,
    headline: 'Account Locked',
    description:
      'All your data is fully preserved and safe. Subscribing below will restore complete access immediately — no data will be lost.',
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

// ─── Circular Ring Progress ───────────────────────────────────────────────────
const CircularProgress: React.FC<{
  pct: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}> = ({ pct, color, size = 88, strokeWidth = 8 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.3, ease: 'easeOut' }}
      />
    </svg>
  );
};

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
  const [adminConfirmAction, setAdminConfirmAction] = useState<
    'enable' | 'disable' | null
  >(null);

  useEffect(() => {
    if (billing && seatInput === '') {
      const { subscription_status: status, declared_seat_count: declared } = billing;
      let seed: number;
      if (status === 'trial') {
        // No committed seats yet — seed from enrolled count or economic minimum, whichever is higher
        seed = Math.max(studentCount, MIN_ECONOMIC_SEATS);
      } else if (status === 'active') {
        // Top-up mode: input is the ADDITIONAL seats to buy — seed at 1
        seed = 1;
      } else {
        // trial_expired / grace / locked — renewal: declared takes priority, studentCount as safety net
        seed = Math.max(declared, studentCount);
      }
      setSeatInput(seed);
    }
  }, [billing, seatInput, studentCount]);

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-32 rounded-2xl bg-neutral-100 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 h-64 rounded-2xl bg-neutral-100 animate-pulse" />
          <div className="lg:col-span-3 h-64 rounded-2xl bg-neutral-100 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── No billing data ──────────────────────────────────────────────────────
  if (!billing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[280px] py-4"
      >
        <div className="text-center space-y-3 max-w-xs">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-sm font-semibold text-neutral-700">
            No billing data available
          </p>
          <p className="text-xs text-neutral-500">
            Please contact support if this persists.
          </p>
        </div>
      </motion.div>
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

  const trialDaysLeft = trial_ends_at ? daysRemaining(trial_ends_at) : 0;
  const trialPct = trial_ends_at ? trialProgress(trial_ends_at) : 0;

  const seatUsagePct = Math.min(
    100,
    Math.round((studentCount / effectiveSeatCap) * 100)
  );

  // ── Status booleans — must be declared first; used by everything below ──
  const isExpiredOrLocked = ['trial_expired', 'grace', 'locked'].includes(
    subscription_status
  );
  const isActiveSubscription = subscription_status === 'active';

  // ── Per-status seat floor ───────────────────────────────────────────────
  // active (top-up): input is a DELTA — minimum 1 additional seat
  // all others: input is the TOTAL — floor is higher of trial cap or enrolled count
  const seatFloor = isActiveSubscription
    ? 1
    : Math.max(TRIAL_SEAT_CAP, studentCount);

  // ── Seat count resolution ───────────────────────────────────────────────
  // Active top-up: resolvedDelta = additional seats being bought
  //               resolvedSeats  = declared + delta  (new total sent to Paystack)
  // All other states: resolvedSeats = total seats as typed
  const defaultSeats = subscription_status === 'trial'
    ? Math.max(studentCount, MIN_ECONOMIC_SEATS)
    : Math.max(declared_seat_count, studentCount);

  const resolvedDelta: number = isActiveSubscription
    ? (seatInput === '' || (seatInput as number) < 1 ? 1 : (seatInput as number))
    : 0;

  const resolvedSeats: number = isActiveSubscription
    ? declared_seat_count + resolvedDelta
    : (seatInput === '' ? defaultSeats : (seatInput as number));

  const seatsValid = isActiveSubscription
    ? resolvedDelta >= 1
    : resolvedSeats >= seatFloor;

  const annualFee = calcAnnualFee(resolvedSeats);
  const isMinimumApplied = resolvedSeats * PER_SEAT_RATE < MINIMUM_FEE;

  // ── Inline seat validation states ──────────────────────────────────────
  // isBelowCommitted is impossible in delta mode (delta >= 1 always adds seats)
  const isBelowCommitted = false;
  const isBelowEnrolled = !isActiveSubscription && resolvedSeats < studentCount;
  const isBelowEconomic = !isBelowEnrolled && resolvedSeats < MIN_ECONOMIC_SEATS;

  // ── Per-status panel labels ─────────────────────────────────────────────
  const panelTitle = (() => {
    switch (subscription_status) {
      case 'active': return 'Top Up Seats';
      case 'trial': return 'Subscribe Early';
      case 'grace': return 'Renew Subscription';
      case 'locked': return 'Restore Access';
      default: return 'Activate Subscription';
    }
  })();

  const panelDescription = (() => {
    switch (subscription_status) {
      case 'active':
        return `Increase your seat quota mid-year. Seats can only go up — current commitment is ${declared_seat_count}.`;
      case 'trial':
        return 'Set your seat count and subscribe securely via Paystack.';
      case 'grace':
        return 'Renew before your account locks. Your data is safe and will be restored immediately.';
      case 'locked':
        return 'Subscribe to restore full platform access immediately. No data has been lost.';
      default:
        return 'Set your seat count and subscribe securely via Paystack.';
    }
  })();

  // ── CTA label ───────────────────────────────────────────────────────────
  const ctaLabel = (() => {
    switch (subscription_status) {
      case 'active': return 'Top Up Seats';
      case 'grace': return 'Renew Subscription';
      case 'locked': return 'Restore Access';
      default: return 'Activate Subscription';
    }
  })();

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

  const seatRingColor = isSeatCapReached
    ? '#EF4444'
    : isSeatWarning
      ? '#F59E0B'
      : cfg.ringColor;

  const seatsAvailable = Math.max(0, effectiveSeatCap - studentCount);

  return (
    <div className="space-y-4 py-4">

      {/* ── 1. Status Hero Banner ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={cn(
          'relative rounded-2xl border overflow-hidden bg-gradient-to-br',
          cfg.gradientClasses
        )}
      >
        {/* Subtle white overlay for glass feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/10 pointer-events-none" />

        <div className="relative px-5 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Left: icon + text */}
          <div className="flex items-start gap-3.5">
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className={cn(
                'p-2.5 rounded-xl border shadow-sm shrink-0',
                cfg.bgColor,
                cfg.borderColor
              )}
            >
              <StatusIcon className={cn('w-5 h-5', cfg.textColor)} />
            </motion.div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight leading-tight">
                  {cfg.headline}
                </h2>
                <Badge
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full border-0',
                    cfg.bgColor,
                    cfg.textColor
                  )}
                >
                  {cfg.label}
                </Badge>
              </div>
              {billing.name && (
                <p className="text-xs font-medium text-neutral-500">
                  {billing.name}
                </p>
              )}
              <p className="text-sm text-neutral-600 leading-relaxed max-w-lg">
                {cfg.description}
              </p>
            </div>
          </div>

          {/* Right: time/status pill */}
          <div className="shrink-0 flex flex-row sm:flex-col items-start sm:items-end gap-1.5">
            {subscription_status === 'trial' && trial_ends_at && (
              <>
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full',
                    trialDaysLeft <= 3
                      ? 'bg-amber-100 text-amber-700'
                      : cfg.pillClasses
                  )}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  {trialDaysLeft > 0
                    ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''
                    } left`
                    : 'Ends today'}
                </div>
                <p className="text-xs text-neutral-400 sm:text-right">
                  Ends {formatDate(trial_ends_at)}
                </p>
              </>
            )}

            {subscription_status === 'active' && current_subscription_ends_at && (
              <>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Active subscription
                </div>
                <p className="text-xs text-neutral-400 sm:text-right">
                  Renews {formatDate(current_subscription_ends_at)} ·{' '}
                  {daysRemaining(current_subscription_ends_at)}d left
                </p>
              </>
            )}

            {isExpiredOrLocked && (
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full',
                  subscription_status === 'grace'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {subscription_status === 'grace'
                  ? current_subscription_ends_at
                    ? `${daysRemaining(current_subscription_ends_at)}d to renew`
                    : 'Renew now'
                  : 'Action required'}
              </div>
            )}
          </div>
        </div>

        {/* Trial progress strip */}
        {subscription_status === 'trial' && trial_ends_at && (
          <div className="relative h-1 bg-white/40">
            <motion.div
              className={cn(
                'h-full',
                trialDaysLeft <= 3 ? 'bg-amber-400' : 'bg-blue-400'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${trialPct}%` }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
            />
          </div>
        )}
      </motion.div>

      {/* ── 2. Two-column: Seat Usage + Subscription ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* ── Seat Usage Card (2 cols) ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
          className="lg:col-span-2"
        >
          <Card className="border border-neutral-200/80 shadow-sm rounded-2xl bg-white h-full">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-neutral-800">
                    Student Seats
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-400">
                    Enrolment quota & usage
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-5 space-y-4">
              {/* Circular ring + numbers */}
              <div className="flex items-center gap-4 pt-1">
                <div className="relative shrink-0">
                  <CircularProgress
                    pct={seatUsagePct}
                    color={seatRingColor}
                    size={88}
                    strokeWidth={8}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className={cn(
                        'text-sm font-bold',
                        isSeatCapReached
                          ? 'text-red-600'
                          : isSeatWarning
                            ? 'text-amber-600'
                            : 'text-neutral-700'
                      )}
                    >
                      {seatUsagePct}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-bold text-neutral-900 leading-none">
                      {studentCount}
                    </span>
                    <span className="text-sm text-neutral-400 font-medium">
                      enrolled
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    of{' '}
                    <span className="font-semibold text-neutral-700">
                      {effectiveSeatCap}
                    </span>{' '}
                    seats
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium',
                      seatsAvailable === 0
                        ? 'bg-red-100 text-red-700'
                        : seatsAvailable <= Math.ceil(effectiveSeatCap * 0.1)
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    {seatsAvailable > 0
                      ? `${seatsAvailable} available`
                      : 'No seats left'}
                  </span>
                </div>
              </div>

              {/* Trial note */}
              {subscription_status === 'trial' && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    Trial cap:{' '}
                    <strong>{TRIAL_SEAT_CAP} seats</strong>. Subscribe to unlock
                    full capacity.
                  </span>
                </div>
              )}

              {/* Capacity alerts */}
              <AnimatePresence mode="wait">
                {isSeatCapReached ? (
                  <motion.div
                    key="cap-reached"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-700"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      <strong>Seat limit reached.</strong> Subscribe below to
                      increase your quota.
                    </span>
                  </motion.div>
                ) : isSeatWarning ? (
                  <motion.div
                    key="cap-warning"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      Approaching seat limit. Consider increasing capacity.
                    </span>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Quick stat tiles */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-xs text-neutral-400 mb-0.5">Declared seats</p>
                  <p className="text-xl font-bold text-neutral-800">
                    {declared_seat_count}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-xs text-neutral-400 mb-0.5">Effective cap</p>
                  <p className="text-xl font-bold text-neutral-800">
                    {effectiveSeatCap}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Subscription / Payment Card (3 cols) ────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.18, ease: 'easeOut' }}
          className="lg:col-span-3"
        >
          <Card className="border border-neutral-200/80 shadow-sm rounded-2xl bg-white h-full">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-neutral-800">
                    {panelTitle}
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-400">
                    {panelDescription}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-5 space-y-4">

              {/* Seat count with stepper */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="seat-count"
                  className="text-xs font-semibold text-neutral-600 uppercase tracking-wide"
                >
                  {isActiveSubscription
                    ? 'Additional seats to add'
                    : 'Students to register this year'}
                </Label>
                <div className="flex items-center gap-2">
                  {/* Decrease button */}
                  <button
                    type="button"
                    aria-label="Decrease seats by 1"
                    disabled={isActiveSubscription
                      ? resolvedDelta <= 1
                      : resolvedSeats <= seatFloor}
                    onClick={() => {
                      if (isActiveSubscription) {
                        setSeatInput(Math.max(1, resolvedDelta - 1));
                      } else {
                        setSeatInput(Math.max(seatFloor, resolvedSeats - 10));
                      }
                    }}
                    className={cn(
                      'w-9 h-9 rounded-lg border flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300',
                      (isActiveSubscription ? resolvedDelta <= 1 : resolvedSeats <= seatFloor)
                        ? 'border-neutral-100 bg-neutral-50 cursor-not-allowed opacity-35'
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200'
                    )}
                  >
                    <Minus className="w-3.5 h-3.5 text-neutral-600" />
                  </button>

                  <Input
                    id="seat-count"
                    type="number"
                    min={isActiveSubscription ? 1 : seatFloor}
                    step={1}
                    value={seatInput}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setSeatInput('');
                      } else {
                        const v = parseInt(e.target.value, 10);
                        setSeatInput(isNaN(v) ? '' : v);
                      }
                    }}
                    onBlur={() => {
                      const floor = isActiveSubscription ? 1 : seatFloor;
                      if (seatInput === '' || (seatInput as number) < floor) {
                        setSeatInput(floor);
                      }
                    }}
                    className={cn(
                      'text-center text-base font-bold h-9 focus:ring-1 focus:ring-blue-100',
                      isBelowEnrolled
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-neutral-200 focus:border-blue-300'
                    )}
                  />

                  <button
                    type="button"
                    aria-label="Increase seats by 1"
                    onClick={() => {
                      if (isActiveSubscription) {
                        setSeatInput(resolvedDelta + 1);
                      } else {
                        setSeatInput(resolvedSeats + 10);
                      }
                    }}
                    className="w-9 h-9 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 flex items-center justify-center transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  >
                    <Plus className="w-3.5 h-3.5 text-neutral-600" />
                  </button>
                </div>

                {/* For top-up mode: show the resulting new total */}
                {isActiveSubscription && (
                  <p className="text-xs text-neutral-500 flex items-center gap-1">
                    <Info className="w-3 h-3 shrink-0" />
                    Current: {declared_seat_count} seats
                    {resolvedDelta > 0 && (
                      <span className="font-semibold text-neutral-700">
                        {' '}+{resolvedDelta} → New total: {resolvedSeats} seats
                      </span>
                    )}
                  </p>
                )}

                {/* Inline contextual guidance — layered by severity */}
                <AnimatePresence mode="wait">
                  {isBelowCommitted ? (
                    <motion.p
                      key="below-committed"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-600 font-medium flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Cannot go below your committed {declared_seat_count} seats for this subscription period.
                    </motion.p>
                  ) : isBelowEnrolled ? (
                    <motion.p
                      key="below-enrolled"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-600 font-medium flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      You have {studentCount} students enrolled — seats cannot be set below this.
                    </motion.p>
                  ) : isBelowEconomic ? (
                    <motion.p
                      key="below-economic"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-amber-600 flex items-center gap-1.5"
                    >
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      Below {MIN_ECONOMIC_SEATS} seats, the GHS {MINIMUM_FEE} minimum fee applies — you pay the same for fewer available seats.
                    </motion.p>
                  ) : isActiveSubscription ? null : (
                    <motion.p
                      key="default-hint"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-neutral-400"
                    >
                      Hard registration ceiling for the year. Minimum {seatFloor} seats.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Fee breakdown panel */}
              <div className="rounded-xl border border-neutral-150 bg-neutral-50/60 overflow-hidden">
                {/* Header row — large fee display */}
                <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Annual fee
                  </span>
                  <motion.span
                    key={annualFee}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-2xl font-bold text-neutral-900"
                  >
                    GHS {annualFee.toFixed(2)}
                  </motion.span>
                </div>

                {/* Line items */}
                <div className="px-4 py-3 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>
                      {resolvedSeats} student
                      {(resolvedSeats as number) !== 1 ? 's' : ''} × GHS{' '}
                      {PER_SEAT_RATE.toFixed(2)}
                    </span>
                    <span className="font-medium text-neutral-800">
                      GHS{' '}
                      {((resolvedSeats as number) * PER_SEAT_RATE).toFixed(2)}
                    </span>
                  </div>

                  {isMinimumApplied && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between font-medium text-amber-600"
                    >
                      <span>Minimum annual fee applied</span>
                      <span>GHS {MINIMUM_FEE.toFixed(2)}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-between font-semibold text-neutral-800 border-t border-neutral-100 pt-2">
                    <span>Total due today</span>
                    <span>GHS {annualFee.toFixed(2)}</span>
                  </div>
                </div>

                {/* Footer note */}
                <div className="px-4 py-2 bg-neutral-100/60 border-t border-neutral-100 text-xs text-neutral-400">
                  GHS 2.00 / student · GHS 200 minimum · Jan 1 – Dec 31
                </div>
              </div>

              {/* CTA button */}
              {isBillingEnabled ? (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    className={cn(
                      'w-full h-11 font-semibold text-sm rounded-xl gap-2 transition-colors',
                      isExpiredOrLocked
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : isActiveSubscription
                          ? 'bg-neutral-800 hover:bg-neutral-900 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    )}
                    disabled={paying || !seatsValid || isBelowEnrolled || isBelowCommitted}
                    onClick={handlePayment}
                  >
                    {paying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Opening payment gateway…
                      </>
                    ) : (
                      <>
                        {ctaLabel} — GHS {annualFee.toFixed(2)}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-200 text-sm text-neutral-500">
                  <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
                  Billing is currently disabled by the platform administrator.
                </div>
              )}

              {/* Payment logos */}
              <div className="flex items-center justify-between pt-0.5">
                <p className="text-xs text-neutral-400 uppercase tracking-widest font-semibold mr-3 whitespace-nowrap">
                  Via Paystack
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src="/images/payment/momo_mtnb.png"
                    alt="MTN Mobile Money"
                    className="h-5 object-contain opacity-50 hover:opacity-90 transition-opacity"
                  />
                  <img
                    src="/images/payment/telecel-cash.webp"
                    alt="Telecel Cash"
                    className="h-5 object-contain opacity-50 hover:opacity-90 transition-opacity"
                  />
                  <img
                    src="/images/payment/ATM-Logo-01.png"
                    alt="Visa / Mastercard"
                    className="h-4 object-contain opacity-50 hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>

              {/* Policy note */}
              <div className="flex items-start gap-2.5 px-3 py-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-neutral-600 leading-relaxed">
                <Info
                  className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p>
                  Subscriptions run{' '}
                  <strong>January 1 – December 31</strong>. Your declared seat
                  count is a hard ceiling — you cannot enrol more students than
                  seats paid for. You can top up mid-year if needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── 3. Platform Admin Controls (super-admin only) ──────────────── */}
      {isSuperAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
        >
          <Card className="border border-neutral-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdminPanel((p) => !p)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
              aria-expanded={showAdminPanel}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  Platform Admin Controls
                </span>
                <Badge className="text-xs bg-amber-50 text-amber-600 border border-amber-100 font-medium px-2 py-0.5">
                  Super Admin
                </Badge>
              </div>
              <motion.div
                animate={{ rotate: showAdminPanel ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-neutral-400"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showAdminPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="px-5 pb-5 pt-2 space-y-4 border-t border-neutral-100">
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Visible only to the platform super-administrator. Use to
                      enable or disable billing enforcement for this
                      organisation.
                    </p>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                      <div>
                        <p className="text-sm font-semibold text-neutral-800">
                          Billing enforcement
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {isBillingEnabled
                            ? 'Trial banners and seat limits are active.'
                            : 'All billing UI is hidden; seat limits bypassed.'}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          'shrink-0 ml-3 text-xs font-semibold border px-2.5 py-0.5',
                          isBillingEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                        )}
                      >
                        {isBillingEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    <AlertDialog
                      open={!!adminConfirmAction}
                      onOpenChange={(open) =>
                        !open && setAdminConfirmAction(null)
                      }
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
                          className="w-full rounded-xl h-9 text-sm font-medium"
                        >
                          {togglingBilling
                            ? 'Updating…'
                            : isBillingEnabled
                              ? 'Disable Billing'
                              : 'Enable Billing'}
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-neutral-900">
                            {adminConfirmAction === 'disable'
                              ? 'Disable Billing?'
                              : 'Enable Billing?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription asChild>
                            <div className="text-neutral-600">
                              <ul className="list-disc list-inside space-y-1.5 text-sm mt-2">
                                {adminConfirmAction === 'disable' ? (
                                  <>
                                    <li>Trial banners and overlays will be hidden</li>
                                    <li>Seat limit enforcement will be bypassed</li>
                                    <li>Users cannot initiate payments</li>
                                    <li>
                                      Active subscriptions remain until their
                                      end date
                                    </li>
                                  </>
                                ) : (
                                  <>
                                    <li>
                                      Trial banners and overlays will be
                                      displayed
                                    </li>
                                    <li>
                                      Seat limit enforcement will be active
                                    </li>
                                    <li>Payment features will be available</li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="flex gap-3 justify-end pt-2">
                          <AlertDialogCancel className="rounded-xl h-9 text-sm">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleAdminToggle}
                            disabled={togglingBilling}
                            className={cn(
                              'rounded-xl h-9 text-sm font-medium',
                              adminConfirmAction === 'disable'
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-blue-600 hover:bg-blue-700'
                            )}
                          >
                            {togglingBilling ? 'Updating…' : 'Confirm'}
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
