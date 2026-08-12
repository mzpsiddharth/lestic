const buckets = new Map<string, number[]>();

function cleanup(now: number) {
  for (const [key, times] of buckets) {
    const fresh = times.filter((t) => now - t < 60 * 60 * 1000);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

/**
 * Simple in-memory rate limiter: allows up to `limit` actions per hour per key.
 * Good enough for MVP anti-spam; swap for a Redis-backed limiter when deployed
 * across multiple instances.
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

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
