import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env";

let client: Redis | null = null;

export const getRedis = () => {
  if (client) return client;

  const { redisUrl, redisToken } = serverEnv;

  if (!redisUrl || !redisToken) {
    throw new Error("Upstash Redis environment variables are not configured.");
  }

  client = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  return client;
};

