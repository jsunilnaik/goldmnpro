// Simple in-memory rate limiter for a "Million Traffic" ready backend
// Note: In serverless environments, this is per-instance, but still provides 
// a robust defense against rapid-fire bot attacks. Use Upstash or Redis for 
// global cross-instance rate limiting.

const rateLimitCache = new Map();

export default function rateLimit(identifier, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const bucket = rateLimitCache.get(identifier);

    if (!bucket) {
        rateLimitCache.set(identifier, {
            count: 1,
            resetTime: now + windowMs
        });
        return { success: true, remaining: limit - 1 };
    }

    if (now > bucket.resetTime) {
        bucket.count = 1;
        bucket.resetTime = now + windowMs;
        return { success: true, remaining: limit - 1 };
    }

    if (bucket.count >= limit) {
        return { success: false, remaining: 0, retryAfter: Math.ceil((bucket.resetTime - now) / 1000) };
    }

    bucket.count++;
    return { success: true, remaining: limit - bucket.count };
}

// Cleanup expired buckets every hour
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitCache.entries()) {
        if (now > value.resetTime) {
            rateLimitCache.delete(key);
        }
    }
}, 3600000);
