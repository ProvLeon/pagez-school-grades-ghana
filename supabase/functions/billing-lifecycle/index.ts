/**
 * billing-lifecycle Edge Function
 *
 * Handles all automatic subscription state transitions and SMS reminders.
 * Called daily by pg_cron via:
 *   SELECT cron.schedule(
 *     'billing-lifecycle-daily',
 *     '0 1 * * *',   -- 1 AM UTC every day
 *     $$
 *       SELECT net.http_post(
 *         url := current_setting('app.edge_function_url') || '/billing-lifecycle',
 *         headers := jsonb_build_object(
 *           'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
 *           'Content-Type', 'application/json'
 *         ),
 *         body := '{}'::jsonb
 *       )
 *     $$
 *   );
 *
 * Transitions handled:
 *   trial        → trial_expired  (when trial_ends_at < NOW())
 *   trial_expired → (no auto-transition — school must pay)
 *   active       → grace          (when current_subscription_ends_at < NOW())
 *   grace        → locked         (after 7 days in grace)
 *   locked       → (stays locked until payment)
 *
 * SMS reminders sent via Arkesel:
 *   Trial:   Day 10 warning, Day 12 urgent (out of 14-day trial)
 *   Active:  Nov 15, Dec 1, Dec 17, Dec 24 (renewal reminders)
 *   Grace:   Daily for 7 days
 *   Locked:  On day of lock
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Organization {
  id: string;
  name: string;
  subscription_status: "trial" | "active" | "trial_expired" | "grace" | "locked";
  trial_ends_at: string | null;
  current_subscription_ends_at: string | null;
  declared_seat_count: number;
  billing_enabled: boolean;
  admin_email: string | null;
  admin_phone: string | null;
}

interface TransitionResult {
  org_id: string;
  from_status: string;
  to_status: string;
  sms_sent: boolean;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const GRACE_PERIOD_DAYS = 7;
const SENDER_ID = "eResultsGH";

// ─── CORS headers ─────────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Arkesel SMS helper ───────────────────────────────────────────────────────
async function sendSMS(phone: string, message: string): Promise<boolean> {
  const apiKey = Deno.env.get("ARKESEL_API_KEY");
  const apiUrl = Deno.env.get("ARKESEL_API_URL") ?? "https://sms.arkesel.com/sms/api";

  if (!apiKey) {
    console.warn("[SMS] ARKESEL_API_KEY not set — skipping SMS.");
    return false;
  }

  // Normalise Ghanaian number (strip leading 0, add +233)
  const normalised = phone.startsWith("0")
    ? "+233" + phone.slice(1)
    : phone.startsWith("+")
      ? phone
      : "+233" + phone;

  try {
    const url = new URL(apiUrl);
    url.searchParams.set("action", "send-sms");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("to", normalised);
    url.searchParams.set("from", SENDER_ID);
    url.searchParams.set("sms", message);

    const resp = await fetch(url.toString(), { method: "GET" });
    const body = await resp.text();

    if (!resp.ok) {
      console.error(`[SMS] Arkesel error for ${normalised}: ${body}`);
      return false;
    }

    console.log(`[SMS] Sent to ${normalised}: OK`);
    return true;
  } catch (err) {
    console.error(`[SMS] Failed to send to ${normalised}:`, err);
    return false;
  }
}

// ─── Message builders ─────────────────────────────────────────────────────────
function trialWarningMsg(schoolName: string, daysLeft: number): string {
  return (
    `Hello ${schoolName}! Your e-Results GH free trial ends in ` +
    `${daysLeft} day${daysLeft === 1 ? "" : "s"}. ` +
    `Subscribe now to keep full access and lock in your student quota. ` +
    `Log in at https://app.eresultsgh.com to subscribe.`
  );
}

function trialExpiredMsg(schoolName: string): string {
  return (
    `Dear ${schoolName}, your e-Results GH free trial has ended. ` +
    `Your data is safe — subscribe to restore full access immediately. ` +
    `Pay via MoMo or Card: https://app.eresultsgh.com/settings?tab=billing`
  );
}

function renewalReminderMsg(schoolName: string, daysLeft: number): string {
  return (
    `Dear ${schoolName}, your e-Results GH subscription renews on January 1. ` +
    `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining. ` +
    `Log in to review your seat count and renew early: ` +
    `https://app.eresultsgh.com/settings?tab=billing`
  );
}

function graceWarningMsg(schoolName: string, daysLeft: number): string {
  return (
    `URGENT — ${schoolName}: Your e-Results GH subscription has expired. ` +
    `You have ${daysLeft} day${daysLeft === 1 ? "" : "s"} before your account locks. ` +
    `Renew now: https://app.eresultsgh.com/settings?tab=billing`
  );
}

function lockedMsg(schoolName: string): string {
  return (
    `Dear ${schoolName}, your e-Results GH account has been locked due to non-payment. ` +
    `Your data is fully preserved. Restore access now: ` +
    `https://app.eresultsgh.com/settings?tab=billing`
  );
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only POST/GET allowed — verify a shared secret to prevent unauthorised calls
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!authHeader.includes(serviceKey.slice(0, 20))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const now = new Date();
  const results: TransitionResult[] = [];

  try {
    // Fetch all organisations with billing enabled
    const { data: orgs, error: fetchError } = await admin
      .from("organizations")
      .select(
        "id, name, subscription_status, trial_ends_at, " +
        "current_subscription_ends_at, declared_seat_count, " +
        "billing_enabled"
      )
      .eq("billing_enabled", true);

    if (fetchError) throw fetchError;
    if (!orgs || orgs.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: "No organisations found." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch admin contacts from user_organization_profiles + auth.users
    // We'll get phone numbers from a profiles table if available
    const { data: adminProfiles } = await admin
      .from("user_organization_profiles")
      .select("organization_id, user_id, role")
      .eq("role", "admin")
      .eq("is_active", true);

    // Build a map: organization_id → user_id (first admin found)
    const orgAdminMap: Record<string, string> = {};
    for (const p of adminProfiles ?? []) {
      if (!orgAdminMap[p.organization_id]) {
        orgAdminMap[p.organization_id] = p.user_id;
      }
    }

    // Fetch user metadata (email, phone) for all admin user_ids
    const adminUserIds = Object.values(orgAdminMap);
    const phoneMap: Record<string, string | null> = {};
    const emailMap: Record<string, string | null> = {};

    if (adminUserIds.length > 0) {
      const { data: { users } } = await admin.auth.admin.listUsers();
      for (const u of users ?? []) {
        if (adminUserIds.includes(u.id)) {
          phoneMap[u.id] = u.phone ?? (u.user_metadata?.phone as string) ?? null;
          emailMap[u.id] = u.email ?? null;
        }
      }
    }

    // ── Process each organisation ────────────────────────────────────────────
    for (const org of orgs as Organization[]) {
      const result: TransitionResult = {
        org_id: org.id,
        from_status: org.subscription_status,
        to_status: org.subscription_status,
        sms_sent: false,
      };

      const adminUserId = orgAdminMap[org.id];
      const adminPhone = adminUserId ? (phoneMap[adminUserId] ?? null) : null;

      try {
        // ── 1. TRIAL → TRIAL_EXPIRED ───────────────────────────────────────
        if (org.subscription_status === "trial" && org.trial_ends_at) {
          const trialEnd = new Date(org.trial_ends_at);
          const daysUntilExpiry = Math.ceil(
            (trialEnd.getTime() - now.getTime()) / 86_400_000
          );

          if (daysUntilExpiry <= 0) {
            // Transition to trial_expired
            await admin
              .from("organizations")
              .update({ subscription_status: "trial_expired" })
              .eq("id", org.id);

            result.to_status = "trial_expired";

            if (adminPhone) {
              result.sms_sent = await sendSMS(
                adminPhone,
                trialExpiredMsg(org.name)
              );
            }
          } else if (daysUntilExpiry === 2) {
            // Day 12 of 14-day trial — urgent warning
            if (adminPhone) {
              result.sms_sent = await sendSMS(
                adminPhone,
                trialWarningMsg(org.name, daysUntilExpiry)
              );
            }
          } else if (daysUntilExpiry === 4) {
            // Day 10 of 14-day trial — early warning
            if (adminPhone) {
              result.sms_sent = await sendSMS(
                adminPhone,
                trialWarningMsg(org.name, daysUntilExpiry)
              );
            }
          }
        }

        // ── 2. ACTIVE → GRACE ─────────────────────────────────────────────
        else if (
          org.subscription_status === "active" &&
          org.current_subscription_ends_at
        ) {
          const subEnd = new Date(org.current_subscription_ends_at);
          const daysUntilExpiry = Math.ceil(
            (subEnd.getTime() - now.getTime()) / 86_400_000
          );

          if (daysUntilExpiry <= 0) {
            // Transition to grace
            await admin
              .from("organizations")
              .update({ subscription_status: "grace" })
              .eq("id", org.id);

            result.to_status = "grace";

            if (adminPhone) {
              result.sms_sent = await sendSMS(
                adminPhone,
                graceWarningMsg(org.name, GRACE_PERIOD_DAYS)
              );
            }
          } else {
            // Renewal reminders for active subscriptions (before Jan 1)
            const reminderDays = [46, 31, 14, 7];
            if (reminderDays.includes(daysUntilExpiry) && adminPhone) {
              result.sms_sent = await sendSMS(
                adminPhone,
                renewalReminderMsg(org.name, daysUntilExpiry)
              );
            }
          }
        }

        // ── 3. GRACE → LOCKED ─────────────────────────────────────────────
        else if (
          org.subscription_status === "grace" &&
          org.current_subscription_ends_at
        ) {
          const graceStart = new Date(org.current_subscription_ends_at);
          const daysInGrace = Math.floor(
            (now.getTime() - graceStart.getTime()) / 86_400_000
          );

          if (daysInGrace >= GRACE_PERIOD_DAYS) {
            // Transition to locked
            await admin
              .from("organizations")
              .update({ subscription_status: "locked" })
              .eq("id", org.id);

            result.to_status = "locked";

            if (adminPhone) {
              result.sms_sent = await sendSMS(adminPhone, lockedMsg(org.name));
            }
          } else {
            // Daily grace reminder
            if (adminPhone) {
              const daysLeft = GRACE_PERIOD_DAYS - daysInGrace;
              result.sms_sent = await sendSMS(
                adminPhone,
                graceWarningMsg(org.name, daysLeft)
              );
            }
          }
        }

        // ── 4. TRIAL_EXPIRED — no auto-transition, just daily nudge ───────
        else if (org.subscription_status === "trial_expired") {
          // Send reminder every 3 days until they subscribe
          const trialEnd = org.trial_ends_at
            ? new Date(org.trial_ends_at)
            : null;

          if (trialEnd) {
            const daysSinceExpiry = Math.floor(
              (now.getTime() - trialEnd.getTime()) / 86_400_000
            );

            if (daysSinceExpiry % 3 === 0 && adminPhone) {
              result.sms_sent = await sendSMS(
                adminPhone,
                trialExpiredMsg(org.name)
              );
            }
          }
        }

        results.push(result);
      } catch (orgErr) {
        console.error(`[ERROR] Processing org ${org.id}:`, orgErr);
        result.error = String(orgErr);
        results.push(result);
      }
    }

    // ── Summary log ─────────────────────────────────────────────────────────
    const transitioned = results.filter(r => r.from_status !== r.to_status);
    const smsSent = results.filter(r => r.sms_sent);

    console.log(
      `[billing-lifecycle] Processed ${orgs.length} orgs. ` +
      `Transitioned: ${transitioned.length}. SMS sent: ${smsSent.length}.`
    );

    return new Response(
      JSON.stringify({
        processed: orgs.length,
        transitioned: transitioned.length,
        sms_sent: smsSent.length,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[billing-lifecycle] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
