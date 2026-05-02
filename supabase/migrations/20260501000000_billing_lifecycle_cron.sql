-- ============================================================
-- MIGRATION: Billing Lifecycle Cron Job
-- ============================================================
-- Schedules the billing-lifecycle Edge Function to run daily
-- at 01:00 UTC. This handles all automatic subscription state
-- transitions and Arkesel SMS reminder dispatch.
--
-- Transitions managed:
--   trial        → trial_expired  (when trial_ends_at has passed)
--   active       → grace          (when current_subscription_ends_at has passed)
--   grace        → locked         (after 7 days in grace)
--   trial_expired → (stays — school must pay to move forward)
--   locked        → (stays — school must pay to restore)
--
-- Prerequisites:
--   • pg_cron extension enabled (enabled by default in Supabase)
--   • pg_net extension enabled  (for HTTP POST from pg_cron)
--   • app.edge_function_base_url Postgres config variable set
--     (add via Supabase Dashboard → Database → Configuration)
--
-- After running this migration, verify the job with:
--   SELECT * FROM cron.job;
-- ============================================================

-- 1. Enable required extensions (no-op if already present)
CREATE EXTENSION IF NOT EXISTS pg_cron  WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net   WITH SCHEMA extensions;

-- 2. Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- 3. Remove any previously scheduled version of this job (idempotent)
SELECT cron.unschedule('billing-lifecycle-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'billing-lifecycle-daily'
);

-- 4. Schedule the job — runs at 01:00 UTC every day
--
--    The Edge Function URL is built from two Supabase Vault secrets:
--      SUPABASE_URL          — your project URL  (auto-available in Edge Functions)
--      SUPABASE_SERVICE_ROLE_KEY — service role key (used as Bearer token)
--
--    Because pg_cron cannot directly reference Vault secrets, we use the
--    Postgres `current_setting()` approach with a pre-configured GUC variable.
--    Set these in Supabase Dashboard → Database → Configuration:
--      app.supabase_url            = https://<ref>.supabase.co
--      app.service_role_key        = eyJ...
--
--    If you prefer not to use GUC variables, you can hard-code the URL in
--    the cron command body below and use supabase_functions.http_request()
--    which is the Supabase-native helper.
-- ============================================================

SELECT cron.schedule(
  'billing-lifecycle-daily',              -- job name (unique)
  '0 1 * * *',                           -- cron expression: 01:00 UTC daily
  $$
    SELECT
      net.http_post(
        url     := current_setting('app.supabase_url', true)
                   || '/functions/v1/billing-lifecycle',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer '
                           || current_setting('app.service_role_key', true)
        ),
        body    := '{}'::jsonb
      ) AS request_id;
  $$
);

-- 5. Verify the job was registered
DO $$
DECLARE
  job_count INT;
BEGIN
  SELECT COUNT(*) INTO job_count
  FROM cron.job
  WHERE jobname = 'billing-lifecycle-daily';

  IF job_count = 0 THEN
    RAISE EXCEPTION 'billing-lifecycle-daily cron job was NOT created — check pg_cron extension availability.';
  ELSE
    RAISE NOTICE 'billing-lifecycle-daily cron job registered successfully (runs daily at 01:00 UTC).';
  END IF;
END $$;


-- ============================================================
-- POST-MIGRATION CHECKLIST
-- ============================================================
-- After applying this migration, complete the following steps:
--
-- 1. Set GUC variables in Supabase Dashboard → Database → Configuration:
--      app.supabase_url      = https://<your-ref>.supabase.co
--      app.service_role_key  = <your-service-role-key>
--
-- 2. Register Edge Function secrets via Supabase CLI:
--      supabase secrets set ARKESEL_API_KEY=OkJWeHpEc0VjMUZkTTRUQkc=
--      supabase secrets set ARKESEL_API_URL=https://sms.arkesel.com/sms/api
--      supabase secrets set PAYSTACK_SECRET_KEY=sk_live_<your-live-secret-key>
--
-- 3. Deploy the Edge Function:
--      supabase functions deploy billing-lifecycle
--      supabase functions deploy paystack-webhook
--
-- 4. Register the Paystack webhook URL in Paystack Dashboard:
--      URL: https://<your-ref>.supabase.co/functions/v1/paystack-webhook
--      Events: charge.success
--
-- 5. Test the cron job manually:
--      SELECT net.http_post(
--        url     := current_setting('app.supabase_url') || '/functions/v1/billing-lifecycle',
--        headers := jsonb_build_object(
--          'Content-Type',  'application/json',
--          'Authorization', 'Bearer ' || current_setting('app.service_role_key')
--        ),
--        body    := '{}'::jsonb
--      );
--
-- 6. Monitor cron run history:
--      SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
-- ============================================================
