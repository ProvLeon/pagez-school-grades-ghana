/**
 * verify-payment Edge Function
 *
 * Called directly from the frontend immediately after the Paystack JS
 * callback fires (charge.success). This function:
 *
 *   1. Accepts { reference, organization_id, seat_count } in the request body.
 *   2. Verifies the transaction reference with Paystack's REST API using the
 *      secret key (server-side only — never exposed to the browser).
 *   3. Checks idempotency against payment_logs so duplicate calls are safe.
 *   4. Updates the organization:
 *        • subscription_status  → 'active'
 *        • declared_seat_count  → seat_count (if provided)
 *        • current_subscription_ends_at → December 31 of the current year
 *   5. Inserts a payment_logs row.
 *   6. Returns the updated billing row so the frontend can refresh immediately
 *      without waiting for the asynchronous Paystack webhook.
 *
 * This removes the dependency on Paystack webhooks reaching localhost during
 * development and guarantees instant UI feedback in production as well.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RequestBody {
  reference: string;
  organization_id: string;
  seat_count?: number;
  is_test?: boolean; // true when using Paystack test keys
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string; // "success" | "failed" | "abandoned"
    reference: string;
    amount: number; // in kobo/pesewas
    currency: string;
    channel: string;
    customer: {
      email: string;
    };
    metadata?: Record<string, unknown>;
  };
}

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── Helper — December 31 of the current calendar year ───────────────────────
function endOfCurrentYear(): string {
  return new Date(
    `${new Date().getFullYear()}-12-31T23:59:59Z`
  ).toISOString();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // ── 1. Parse and validate the request body ────────────────────────────
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { reference, organization_id, seat_count, is_test } = body;

    if (!reference || !organization_id) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: reference, organization_id",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 2. Resolve correct Paystack secret key (live vs test) ─────────────
    // The frontend passes is_test=true when VITE_PAYSTACK_ENV !== 'live'.
    // A TEST transaction reference MUST be verified with the TEST secret key —
    // using the live key returns "transaction not found" from Paystack.
    const paystackSecretKey = is_test
      ? (Deno.env.get("PAYSTACK_SECRET_KEY_TEST") ?? Deno.env.get("PAYSTACK_SECRET_KEY"))
      : (Deno.env.get("PAYSTACK_SECRET_KEY_LIVE") ?? Deno.env.get("PAYSTACK_SECRET_KEY"));

    console.log(`[verify-payment] Using ${is_test ? "TEST" : "LIVE"} Paystack key.`);

    if (!paystackSecretKey) {
      console.error(
        `[verify-payment] No Paystack ${is_test ? "test" : "live"} secret key configured.`
      );
      return new Response(
        JSON.stringify({
          error: "Payment gateway not configured. Contact support.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 3. Verify transaction with Paystack ───────────────────────────────
    const paystackResp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!paystackResp.ok) {
      const errorText = await paystackResp.text();
      console.error("[verify-payment] Paystack API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Could not verify payment with Paystack.",
          detail: errorText,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const paystackData: PaystackVerifyResponse = await paystackResp.json();

    // Paystack returns status: true AND data.status: "success" for a paid txn
    if (
      !paystackData.status ||
      paystackData.data?.status !== "success"
    ) {
      console.warn(
        "[verify-payment] Transaction not successful:",
        paystackData.data?.status
      );
      return new Response(
        JSON.stringify({
          error: "Payment was not successful.",
          paystack_status: paystackData.data?.status,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const amountGHS = paystackData.data.amount / 100;
    const channel = paystackData.data.channel ?? "unknown";

    // ── 4. Initialise Supabase admin client (bypasses RLS) ────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ── 5. Idempotency check — has this reference already been processed? ──
    const { data: existingLog } = await admin
      .from("payment_logs")
      .select("id")
      .eq("transaction_reference", reference)
      .maybeSingle();

    if (existingLog) {
      console.log(
        `[verify-payment] Reference ${reference} already processed — returning current billing state.`
      );

      // Still return the current billing row so the frontend refreshes
      const { data: billing } = await admin
        .from("organizations")
        .select(
          "id, name, subscription_status, declared_seat_count, " +
          "trial_ends_at, current_subscription_ends_at, billing_enabled"
        )
        .eq("id", organization_id)
        .single();

      return new Response(
        JSON.stringify({ already_processed: true, billing }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 6. Insert payment log ─────────────────────────────────────────────
    const { error: logError } = await admin.from("payment_logs").insert({
      organization_id,
      transaction_reference: reference,
      amount_paid_ghs: amountGHS,
      payment_status: "success",
      payment_channel: channel,
    });

    if (logError) {
      // Non-fatal — log and continue; idempotency key prevents re-processing
      console.error("[verify-payment] Failed to insert payment log:", logError);
    }

    // ── 7. Build the update payload ───────────────────────────────────────
    const updatePayload: Record<string, unknown> = {
      subscription_status: "active",
      current_subscription_ends_at: endOfCurrentYear(),
    };

    // Persist the seat count the school paid for
    if (seat_count !== undefined && seat_count > 0 && !isNaN(seat_count)) {
      updatePayload.declared_seat_count = seat_count;
    }

    // ── 8. Activate the subscription ─────────────────────────────────────
    const { error: updateError } = await admin
      .from("organizations")
      .update(updatePayload)
      .eq("id", organization_id);

    if (updateError) {
      console.error(
        "[verify-payment] Failed to activate subscription:",
        updateError
      );
      return new Response(
        JSON.stringify({
          error: "Payment verified but subscription update failed. Contact support.",
          detail: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ── 9. Fetch and return the updated billing row ───────────────────────
    const { data: billing, error: fetchError } = await admin
      .from("organizations")
      .select(
        "id, name, subscription_status, declared_seat_count, " +
        "trial_ends_at, current_subscription_ends_at, billing_enabled"
      )
      .eq("id", organization_id)
      .single();

    if (fetchError) {
      console.error(
        "[verify-payment] Failed to fetch updated billing row:",
        fetchError
      );
    }

    console.log(
      `[verify-payment] SUCCESS — Org ${organization_id} activated.` +
      ` Paid: GHS ${amountGHS}` +
      (seat_count ? ` | Seats: ${seat_count}` : "") +
      ` | Ref: ${reference}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        amount_ghs: amountGHS,
        billing,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[verify-payment] Unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error.", detail: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
