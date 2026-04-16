-- ============================================
-- MIGRATION: Create Payment Logs for Paystack Webhooks
-- ============================================
-- This table ensures that if a webhook is fired multiple times, 
-- we do not double-upgrade the account or log duplicate payments,
-- acting as the webhook idempotency layer.

CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transaction_reference VARCHAR(255) NOT NULL UNIQUE,
    amount_paid_ghs DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL,
    payment_channel VARCHAR(50),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS to prevent unauthorized access
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view their own payment logs, but cannot insert directly from frontend
-- (Insertions happen securely in the backend edge function via service role key)
CREATE POLICY "Admins can view own org payment logs" ON public.payment_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.user_organization_profiles
      WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
    )
  );

-- Helper to log success
DO $$
BEGIN
  RAISE NOTICE 'Payment logs table created successfully.';
END $$;
