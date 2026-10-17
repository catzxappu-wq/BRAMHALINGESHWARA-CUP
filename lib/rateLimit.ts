interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean old entries occasionally
  if (rateLimitMap.size > 10000) {
    rateLimitMap.forEach((val, key) => {
      if (now > val.resetAt) {
        rateLimitMap.delete(key);
      }
    });
  }

  if (!record || now > record.resetAt) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSec: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.max(0, Math.ceil((record.resetAt - now) / 1000)),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSec: Math.max(0, Math.ceil((record.resetAt - now) / 1000)),
  };
}
