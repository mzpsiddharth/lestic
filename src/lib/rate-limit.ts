import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const buckets = new Map<string, number[]>();

function cleanup(now: number) {
  for (const [key, times] of buckets) {
    const fresh = times.filter((t) => now - t < 60 * 60 * 1000);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

/**
 * Cheap in-memory rate limiter: allows up to `limit` actions per hour per key.
 * This is a first-line filter only — state lives in a single process and is
 * NOT shared across serverless instances. Use persistentRateLimit for the
 * real gate on any action that writes data.
 */
export function rateLimit(key: string, limit = 5): boolean {
  const now = Date.now();
  cleanup(now);
  const times = buckets.get(key) ?? [];
  if (times.length >= limit) return false;
  times.push(now);
  buckets.set(key, times);
  return true;
}

/**
 * Serverless-safe limiter backed by Postgres (rate_limit_hit RPC).
 * State is shared across instances and survives cold starts. The RPC takes a
 * per-key advisory lock, so concurrent calls for the same key are serialized.
 * Fails open: if the limiter is unavailable we allow the request rather than
 * block real customers.
 */
export async function persistentRateLimit(
  supabase: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("rate_limit_hit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("rate_limit_hit failed:", error.message);
      return true;
    }
    return data === true;
  } catch (err) {
    console.error("rate_limit_hit error:", err);
    return true;
  }
}

/**
 * Client IP behind a trusted proxy (e.g. Vercel). We take the LAST entry of
 * x-forwarded-for — the value appended by the trusted proxy — rather than the
 * first, which a client can spoof. Falls back to a per-request unique key so
 * no shared "unknown" bucket can be exhausted on behalf of other visitors.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const ips = fwd
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (ips.length > 0) return ips[ips.length - 1];
  }
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  return `req-${randomUUID()}`;
}
