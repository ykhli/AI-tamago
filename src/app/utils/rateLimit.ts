import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export async function rateLimit(userId: string) {
  // Rate limit through Upstash
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.tokenBucket(1, "60 d", 50),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
  return await ratelimit.limit(userId);
}
