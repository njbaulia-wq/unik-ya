/**
 * L4 rate limiter in-memory (token bucket sederhana per kunci).
 * Cukup untuk v1 single-instance; multi-instance → ganti Redis tanpa ubah API.
 */
interface Bucket {
  hits: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimit {
  allowed: boolean;
  remaining: number;
}

export function checkRateLimit(key: string, opts: { limit?: number; windowMs?: number; now?: number } = {}): RateLimit {
  const limit = opts.limit ?? 10;
  const windowMs = opts.windowMs ?? 10 * 60_000;
  const now = opts.now ?? Date.now();
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    return { allowed: false, remaining: 0 };
  }
  bucket.hits.push(now);
  if (buckets.size > 5000) {
    const oldest = buckets.keys().next().value;
    if (oldest) buckets.delete(oldest);
  }
  return { allowed: true, remaining: limit - bucket.hits.length };
}

/** Untuk test: reset semua bucket. */
export function resetRateLimits(): void {
  buckets.clear();
}
