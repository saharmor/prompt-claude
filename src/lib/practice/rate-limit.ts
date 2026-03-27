type RateLimitBucket = {
  entries: Array<{ at: number; units: number }>;
};

const RATE_LIMITS = new Map<string, RateLimitBucket>();

function getBucket(key: string) {
  const existing = RATE_LIMITS.get(key);
  if (existing) {
    return existing;
  }

  const created: RateLimitBucket = { entries: [] };
  RATE_LIMITS.set(key, created);
  return created;
}

export function consumeRateLimit({
  bucketKey,
  maxUnits,
  units = 1,
  windowMs,
}: {
  bucketKey: string;
  maxUnits: number;
  units?: number;
  windowMs: number;
}) {
  const now = Date.now();
  const bucket = getBucket(bucketKey);
  bucket.entries = bucket.entries.filter((entry) => now - entry.at < windowMs);

  const usedUnits = bucket.entries.reduce((sum, entry) => sum + entry.units, 0);
  if (usedUnits + units > maxUnits) {
    const oldest = bucket.entries[0];
    const retryAfterMs = oldest ? Math.max(windowMs - (now - oldest.at), 1000) : windowMs;

    return {
      allowed: false,
      retryAfterMs,
    };
  }

  bucket.entries.push({ at: now, units });
  return {
    allowed: true,
    retryAfterMs: 0,
  };
}
