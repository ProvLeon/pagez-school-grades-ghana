import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';

export const BillingAdminSettings: React.FC = () => {
  const { billing, isBillingEnabled, togglingBilling, toggleBillingEnabled } = useBilling();
  const [confirmAction, setConfirmAction] = useState<'enable' | 'disable' | null>(null);

  if (!billing) {
    return null;
  }

  const handleToggle = async () => {
    if (!confirmAction) return;

    const newState = confirmAction === 'enable';
    await toggleBillingEnabled(newState);
    setConfirmAction(null);
  };

  return (
    <Card className="shadow-sm border-amber-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg">Billing & Subscriptions</CardTitle>
          </div>
          <Badge variant={isBillingEnabled ? 'default' : 'secondary'} className="gap-1">
            {isBillingEnabled ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Enabled
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Disabled
              </>
            )}
          </Badge>
        </div>
        <CardDescription>
          Control whether billing and subscription features are active for your school.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Information */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">
                {isBillingEnabled
                  ? 'Billing is currently enabled'
                  : 'Billing is currently disabled'}
              </p>
              <p className="text-gray-600">
                {isBillingEnabled
                  ? 'Students can register up to your seat limit. Trial and subscription enforcement are active.'
                  : 'Trial banners and subscription overlays are hidden. Seat limits are not enforced.'}
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <AlertDialogTrigger asChild>
            <Button
              variant={isBillingEnabled ? 'destructive' : 'default'}
              disabled={togglingBilling}
              className="w-full"
              onClick={() => setConfirmAction(isBillingEnabled ? 'disable' : 'enable')}
            >
              {togglingBilling ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Updating...
                </>
              ) : isBillingEnabled ? (
                'Disable Billing'
              ) : (
                'Enable Billing'
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmAction === 'disable'
                  ? 'Disable Billing?'
                  : 'Enable Billing?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction === 'disable' ? (
                  <div className="space-y-2">
                    <p>
                      When billing is disabled, the following occurs:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-1">
                      <li>Trial banners and subscription overlays will not be shown</li>
                      <li>Seat limit enforcement will be bypassed</li>
                      <li>Users cannot initiate payments</li>
                      <li>Active subscriptions remain until their end date</li>
                    </ul>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p>
                      When billing is enabled, the following occurs:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm ml-1">
                      <li>Trial banners and subscription overlays will be displayed</li>
                      <li>Seat limit enforcement will be active</li>
                      <li>Payment features will be available</li>
                      <li>Subscription status will be monitored</li>
                    </ul>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end pt-4">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggle}
                disabled={togglingBilling}
                className={confirmAction === 'disable' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {togglingBilling ? 'Updating...' : 'Confirm'}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Additional Info */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <span className="font-medium">💡 Tip:</span> Use this toggle to test the application without billing features, or to disable billing during free trial periods.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
