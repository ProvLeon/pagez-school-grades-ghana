import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { paystackRequest, requirePaystackConfig, verifyPaystackSignature, PaystackTransaction } from "../_shared/paystack.ts";
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-paystack-signature, content-type",
};
Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers });
  try {
    const body = await request.arrayBuffer(); const signature = request.headers.get("x-paystack-signature"); const { secret, mode } = requirePaystackConfig();
    if (!signature || !(await verifyPaystackSignature(body, signature, secret))) return new Response("Invalid signature", { status: 400, headers });
    const event = JSON.parse(new TextDecoder().decode(body));
    if (event.event !== "charge.success" || typeof event.data?.reference !== "string") return new Response(JSON.stringify({ received: true }), { status: 200, headers });
    const reference = event.data.reference as string;
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: order } = await admin.from("checkout_orders").select("reference").eq("reference", reference).maybeSingle();
    if (!order) return new Response(JSON.stringify({ received: true }), { status: 200, headers });
    const transaction = await paystackRequest<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`, { method: "GET" }, secret);
    if (transaction.status !== "success" || transaction.reference !== reference) return new Response("Payment pending", { status: 202, headers });
    const { error } = await admin.rpc("settle_checkout_order", { p_reference: reference, p_mode: mode, p_amount: transaction.amount, p_currency: transaction.currency, p_paid_at: new Date().toISOString(), p_channel: transaction.channel ?? "unknown" });
    if (error) throw error;
    return new Response(JSON.stringify({ received: true }), { status: 200, headers });
  } catch (error) { console.error("[paystack-webhook] failed", error instanceof Error ? error.message : "unknown error"); return new Response(JSON.stringify({ error: "Webhook retry required" }), { status: 500, headers }); }
});
