import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { billingService } from '@/services/billingService';

export default function BillingReturn() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'fulfilled' | 'pending' | 'failed'>('checking');

  useEffect(() => {
    const reference = params.get('reference') ?? params.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }
    billingService.verifyAndActivate(reference).then(({ success }) => {
      setStatus(success ? 'fulfilled' : 'pending');
    });
  }, [params]);

  const copy = {
    checking: ['Confirming your payment…', 'Please keep this page open while we verify the transaction.'],
    fulfilled: ['Payment confirmed', 'Your subscription and seat quota are now active.'],
    pending: ['Payment is being confirmed', 'We received the return from Paystack. Refresh this page shortly or contact support if this persists.'],
    failed: ['Payment could not be confirmed', 'No entitlement was changed. Please return to billing and try again.'],
  }[status];

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <section className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">{copy[0]}</h1>
        <p className="text-muted-foreground">{copy[1]}</p>
        {status !== 'checking' && <Link className="underline" to="/settings">Return to billing</Link>}
      </section>
    </main>
  );
}
