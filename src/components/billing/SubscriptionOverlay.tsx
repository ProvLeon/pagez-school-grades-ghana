import React from 'react';
import { useBilling } from '@/hooks/useBilling';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard } from 'lucide-react';

export const SubscriptionOverlay = () => {
  const { billing, initiatePayment, loading } = useBilling();

  if (loading || !billing) return null;

  const { subscription_status, declared_seat_count } = billing;

  // Render overlay only if expired, grace, or locked
  if (['active', 'trial'].includes(subscription_status)) {
    return null;
  }

  // Cost calculation based on Phase 1 pricing: GHS 2 per student * declared_seat_count
  const RATE_PER_STUDENT = 2.00;
  const amountToPay = declared_seat_count * RATE_PER_STUDENT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <Card className="w-full max-w-md shadow-2xl glass-panel relative overflow-hidden border-border/50">
        
        {/* Aesthetic background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

        <CardHeader className="text-center pb-2 relative z-10">
          <div className="mx-auto bg-destructive/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4 ring-8 ring-destructive/5 transition-all">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {subscription_status === 'trial_expired' ? 'Trial Expired' : 'Subscription Ended'}
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2 px-4 leading-relaxed">
            Your platform access is currently restricted to view-only. 
            No records can be modified until your subscription is renewed.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10 pt-4">
          <div className="bg-card/50 border border-border/40 rounded-xl p-5 space-y-3">
             <div className="flex justify-between items-center">
               <span className="text-sm font-medium text-muted-foreground">Registered Seats</span>
               <span className="text-base font-semibold text-foreground">{declared_seat_count}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm font-medium text-muted-foreground">Rate per Student</span>
               <span className="text-base font-semibold text-foreground">GHS {RATE_PER_STUDENT.toFixed(2)} / yr</span>
             </div>
             <div className="border-t border-border/40 pt-3 mt-3 flex justify-between items-center">
               <span className="font-semibold text-foreground">Total Annual Fee</span>
               <span className="font-bold text-xl text-primary bg-primary/10 px-3 py-1 rounded-md">
                 GHS {amountToPay.toFixed(2)}
               </span>
             </div>
          </div>
        </CardContent>
        
        <CardFooter className="relative z-10 pb-6 pt-2">
          <Button 
            className="w-full h-12 text-[15px] font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]" 
            onClick={() => initiatePayment(amountToPay)}
          >
            <CreditCard className="w-5 h-5 mr-2.5" />
            Pay Now via Paystack (MoMo / Card)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
