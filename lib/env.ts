const missingValue = (name: string) => {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required env var: ${name}`);
  }
  console.warn(`⚠️ Missing env var: ${name}`);
};

export const publicEnv = {
  awsRegion: process.env.NEXT_PUBLIC_AWS_REGION ?? "",
  amplifyIdentityPoolId: process.env.NEXT_PUBLIC_AMPLIFY_IDENTITY_POOL_ID ?? "",
  amplifyBucket: process.env.NEXT_PUBLIC_AMPLIFY_FILE_BUCKET ?? "",
  amplifyBucketPrefix:
    process.env.NEXT_PUBLIC_AMPLIFY_BUCKET_PREFIX ?? "uploads/",
  solanaCluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "mainnet-beta",
  platformFeeBps: Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_BPS ?? 250),
};

export const serverEnv = {
  redisUrl: process.env.UPSTASH_REDIS_REST_URL,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  solanaEndpoint:
    process.env.SOLANA_RPC_ENDPOINT ?? "https://api.mainnet-beta.solana.com",
  escrowProgramId: process.env.SOLANA_ESCROW_PROGRAM_ID,
  platformCustodySecret: process.env.PLATFORM_CUSTODY_SECRET_KEY,
  requesterWebhookSecret: process.env.REQUESTER_WEBHOOK_SECRET,
  adminApiKey: process.env.ADMIN_API_KEY,
};

export const requireServerEnv = () => {
  (["redisUrl", "redisToken", "solanaEndpoint"] as const).forEach((key) => {
    if (!serverEnv[key]) {
      missingValue(key);
    }
  });
};

