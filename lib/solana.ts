import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";
import { publicEnv, serverEnv } from "@/lib/env";

let connection: Connection | null = null;
let custodyKeypair: Keypair | null = null;

const parseSecret = (secretRaw: string): Uint8Array => {
  try {
    const parsed = JSON.parse(secretRaw) as number[];
    return Uint8Array.from(parsed);
  } catch {
    return bs58.decode(secretRaw);
  }
};

export const getSolanaConnection = () => {
  if (connection) return connection;

  const endpoint =
    serverEnv.solanaEndpoint ??
    clusterApiUrl(publicEnv.solanaCluster as "mainnet-beta");

  connection = new Connection(endpoint, "confirmed");
  return connection;
};

export const getCustodyKeypair = () => {
  if (custodyKeypair) {
    return custodyKeypair;
  }

  const secretRaw = serverEnv.platformCustodySecret;
  if (!secretRaw) {
    throw new Error(
      "Missing PLATFORM_CUSTODY_SECRET_KEY for platform escrow custody."
    );
  }

  custodyKeypair = Keypair.fromSecretKey(parseSecret(secretRaw));
  return custodyKeypair;
};

export const getPublicKey = (value: string | PublicKey) => {
  if (value instanceof PublicKey) return value;
  return new PublicKey(value);
};

