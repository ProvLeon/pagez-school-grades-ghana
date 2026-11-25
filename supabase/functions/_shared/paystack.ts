export interface PaystackTransaction {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

export function requirePaystackConfig() {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY") || Deno.env.get("PAYSTACK_SECRET_KEY_LIVE");
  let mode = Deno.env.get("PAYSTACK_MODE");
  if (!mode && secret) {
    mode = secret.startsWith("sk_live_") ? "live" : secret.startsWith("sk_test_") ? "test" : undefined;
  }
  if (!secret || (mode !== "live" && mode !== "test")) throw new Error("Payment gateway is not configured");
  const expectedPrefix = mode === "live" ? "sk_live_" : "sk_test_";
  if (!secret.startsWith(expectedPrefix)) throw new Error("Payment gateway mode mismatch");
  return { secret, mode };
}

export async function paystackRequest<T>(path: string, init: RequestInit, secret: string): Promise<T> {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      "User-Agent": "eResultsGH/1.0",
      ...(init.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.status) {
    const errorMsg = payload?.message || response.statusText || `HTTP ${response.status}`;
    throw new Error(`Paystack error: ${errorMsg}`);
  }
  return payload.data as T;
}

export async function verifyPaystackSignature(body: ArrayBuffer, signature: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, body);
  const expected = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
  if (signature.length !== expected.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index++) mismatch |= signature.charCodeAt(index) ^ expected.charCodeAt(index);
  return mismatch === 0;
}
