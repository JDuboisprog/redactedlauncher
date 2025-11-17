import "server-only";

import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import type { UserRole, WalletMetadata } from "@/lib/types";
import { getRedis } from "@/lib/redis";
import { nowIso } from "@/lib/utils";

interface StoredWallet extends WalletMetadata {
  secretKey: string; // base58
}

const walletKey = (userId: string) => `wallets:${userId}`;

const deserialize = (record: StoredWallet) => {
  const secret = bs58.decode(record.secretKey);
  return {
    metadata: record as WalletMetadata,
    keypair: Keypair.fromSecretKey(secret),
  };
};

export const getOrCreateWallet = async (
  userId: string,
  role: UserRole
): Promise<{ metadata: WalletMetadata; keypair: Keypair }> => {
  const redis = getRedis();
  const cache = await redis.get<StoredWallet>(walletKey(userId));
  if (cache) {
    return deserialize(cache);
  }

  const keypair = Keypair.generate();
  const record: StoredWallet = {
    ownerId: userId,
    role,
    address: keypair.publicKey.toBase58(),
    lastSyncedAt: nowIso(),
    secretKey: bs58.encode(keypair.secretKey),
  };

  await redis.set(walletKey(userId), record);
  return deserialize(record);
};

export const getWallet = async (userId: string) => {
  const redis = getRedis();
  const cache = await redis.get<StoredWallet>(walletKey(userId));
  return cache ? deserialize(cache) : null;
};

