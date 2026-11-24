import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { paystackRequest, requirePaystackConfig } from "../_shared/paystack.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders });
interface Order { reference: string; amount_pesewas: number; mode: "test" | "live"; organization_id: string; }

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) return json({ error: "Authentication required" }, 401);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Authentication required" }, 401);
    const input = await request.json().catch(() => null);
    const organizationId = typeof input?.organization_id === "string" ? input.organization_id : "";
    const seatCount = Number.isInteger(input?.seat_count) ? input.seat_count : 0;
    const idempotencyKey = typeof input?.idempotency_key === "string" ? input.idempotency_key : "";
    if (!organizationId || seatCount < 1 || seatCount > 1_000_000 || idempotencyKey.length < 16 || idempotencyKey.length > 128) return json({ error: "Invalid checkout request" }, 400);
    const { secret, mode } = requirePaystackConfig();
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: order, error: orderError } = await admin.rpc("create_checkout_order", { p_org: organizationId, p_user: user.id, p_seats: seatCount, p_mode: mode, p_idempotency_key: idempotencyKey });
    if (orderError || !order) return json({ error: "Unable to create checkout" }, orderError?.code === "42501" ? 403 : 400);
    const checkout = order as Order;
    const callbackUrl = Deno.env.get("PAYSTACK_CALLBACK_URL") || "https://eresultsgh.com/billing/return";
    if (!callbackUrl.startsWith("https://") && !callbackUrl.startsWith("http://localhost")) return json({ error: "Payment callback is not configured" }, 500);
    const payment = await paystackRequest<{ authorization_url: string }>("/transaction/initialize", { method: "POST", body: JSON.stringify({ amount: order.amount_pesewas, currency: "GHS", email: user.email, reference: checkout.reference, callback_url: callbackUrl }) }, secret);
    if (!payment.authorization_url.startsWith("https://checkout.paystack.com/")) return json({ error: "Invalid checkout response" }, 502);
    return json({ reference: checkout.reference, authorization_url: payment.authorization_url });
  } catch (error) {
    console.error("[initialize-payment] failed", error instanceof Error ? error.message : "unknown error");
    return json({ error: "Unable to start payment" }, 500);
  }
});
