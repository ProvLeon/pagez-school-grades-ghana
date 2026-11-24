import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { paystackRequest, requirePaystackConfig, PaystackTransaction } from "../_shared/paystack.ts";
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Authentication required" }, 401);
    const input = await request.json().catch(() => null);
    const reference = typeof input?.reference === "string" ? input.reference : "";
    if (!reference) return json({ error: "Reference required" }, 400);
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Authentication required" }, 401);
    const { secret, mode } = requirePaystackConfig();
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: order } = await admin.from("checkout_orders").select("organization_id").eq("reference", reference).eq("created_by", user.id).maybeSingle();
    if (!order) return json({ error: "Payment order not found" }, 404);
    const transaction = await paystackRequest<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`, { method: "GET" }, secret);
    if (transaction.status !== "success" || transaction.reference !== reference) return json({ status: "pending" }, 202);
    const { data, error } = await admin.rpc("settle_checkout_order", { p_reference: reference, p_mode: mode, p_amount: transaction.amount, p_currency: transaction.currency, p_paid_at: new Date().toISOString(), p_channel: transaction.channel ?? "unknown" });
    if (error) return json({ error: "Payment requires review" }, 409);
    return json({ status: data });
  } catch (error) { console.error("[verify-payment] failed", error instanceof Error ? error.message : "unknown error"); return json({ error: "Unable to verify payment" }, 502); }
});
