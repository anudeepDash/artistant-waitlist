import 'server-only';
import { headers } from 'next/headers';

/**
 * Best-effort fixed-window rate limiter for abuse-prone public server actions
 * (emails, form submissions). State is per server instance, so it bounds bursts
 * rather than enforcing a global quota.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const MAX_BUCKETS = 10_000;

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
}

/** Returns true when the call is allowed, false when the caller is over the limit. */
export async function checkRateLimit(scope: string, limit: number, windowMs: number, key?: string): Promise<boolean> {
  const now = Date.now();
  const id = `${scope}:${key ?? await clientIp()}`;

  if (buckets.size > MAX_BUCKETS) {
    for (const [k, v] of buckets) {
      if (v.resetAt <= now) buckets.delete(k);
    }
  }

  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
