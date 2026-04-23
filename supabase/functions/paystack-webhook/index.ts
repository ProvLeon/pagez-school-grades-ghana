import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("PAYSTACK_SECRET_KEY is not set in Edge Function Environment Variables");
    }

    // Get the raw text body and the Paystack signature
    const textBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return new Response("Missing Paystack signature", { status: 400 });
    }

    // Verify HMAC SHA512 Signature (Native Deno WebCrypto)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(paystackSecretKey),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign", "verify"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(textBody));

    // Convert Buffer to Hex String
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error("Invalid Paystack Signature");
      return new Response("Invalid signature", { status: 400 });
    }

    // Parse the verified JSON payload
    const event = JSON.parse(textBody);

    // We only care about charge.success for upgrades
    if (event.event === "charge.success") {
      const { reference, amount, metadata, channel } = event.data;

      // Expected from Frontend: The organization's UUID must be passed in custom_fields / metadata
      const organizationId = metadata?.organization_id;

      if (!organizationId) {
        console.error("Payment received but no organization_id found in metadata");
        return new Response("Missing organization_id", { status: 400 });
      }

      // Initialize Supabase Admin Client to bypass RLS
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      // Check for Idempotency (has this transaction ref already been processed?)
      const { data: existingLog } = await adminClient
        .from("payment_logs")
        .select("id")
        .eq("transaction_reference", reference)
        .maybeSingle();

      if (existingLog) {
        console.log(`Transaction ${reference} already processed.`);
        return new Response(JSON.stringify({ status: "already processed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 1. Insert Payment Log
      const amountGHS = amount / 100; // Paystack sends amounts in pesewas
      const { error: logError } = await adminClient
        .from("payment_logs")
        .insert({
          organization_id: organizationId,
          transaction_reference: reference,
          amount_paid_ghs: amountGHS,
          payment_status: "success",
          payment_channel: channel || "unknown"
        });

      if (logError) {
        console.error("Error creating payment log:", logError);
        throw logError;
      }

      // 2. Upgrade the tenant to 'active' until Dec 31 of current year (Phase 1 Option D Billing)
      const currentYear = new Date().getFullYear();
      const endOfYear = new Date(`${currentYear}-12-31T23:59:59Z`).toISOString();

      // Extract seat_count from metadata custom_fields if provided
      const seatCountField = metadata?.custom_fields?.find(
        (f: { variable_name: string; value: string }) => f.variable_name === "seat_count"
      );
      const seatCount = seatCountField ? parseInt(seatCountField.value, 10) : null;

      const updatePayload: Record<string, unknown> = {
        subscription_status: "active",
        current_subscription_ends_at: endOfYear,
      };

      // Persist the declared_seat_count the school paid for so the cap is enforced correctly
      if (seatCount && !isNaN(seatCount) && seatCount > 0) {
        updatePayload.declared_seat_count = seatCount;
      }

      const { error: upgradeError } = await adminClient
        .from("organizations")
        .update(updatePayload)
        .eq("id", organizationId);

      if (upgradeError) {
        console.error("Error upgrading subscription:", upgradeError);
        throw upgradeError;
      }

      console.log(
        `[SUCCESS] Upgraded Organization ${organizationId} to Active.` +
        ` Paid: GHS ${amountGHS}` +
        (seatCount ? ` | Seats: ${seatCount}` : "")
      );
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error("Webhook Processing Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
