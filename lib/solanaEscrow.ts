import "server-only";

import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { v4 as uuid } from "uuid";

import { getRedis } from "@/lib/redis";
import { getSolanaConnection, getPublicKey } from "@/lib/solana";
import { getWallet } from "@/lib/solanaWallets";
import type { PaymentEvent } from "@/lib/types";
import { nowIso } from "@/lib/utils";

interface EscrowRecord {
  taskId: string;
  account: string;
  secret: string;
  balanceLamports: number;
  createdAt: string;
  updatedAt: string;
}

const escrowKey = (taskId: string) => `escrow:${taskId}`;
const paymentKey = (taskId: string) => `payments:${taskId}`;

const deserializeEscrow = (record: EscrowRecord) => ({
  ...record,
  keypair: Keypair.fromSecretKey(bs58.decode(record.secret)),
});

const recordPaymentEvent = async (event: PaymentEvent) => {
  const redis = getRedis();
  await redis.lpush(paymentKey(event.taskId), JSON.stringify(event));
};

export const getEscrowForTask = async (taskId: string) => {
  const redis = getRedis();
  const record = await redis.get<EscrowRecord>(escrowKey(taskId));
  return record ? deserializeEscrow(record) : null;
};

export const listPaymentEvents = async (taskId: string) => {
  const redis = getRedis();
  const raw = await redis.lrange(paymentKey(taskId), 0, -1);
  return raw.map((entry) => JSON.parse(entry) as PaymentEvent);
};

export const fundEscrowFromRequester = async ({
  taskId,
  requesterId,
  amountLamports,
}: {
  taskId: string;
  requesterId: string;
  amountLamports: number;
}) => {
  const redis = getRedis();
  const connection = getSolanaConnection();
  const requesterWallet = await getWallet(requesterId);
  if (!requesterWallet) {
    throw new Error(`Requester wallet not found for ${requesterId}`);
  }

  const now = nowIso();
  let record = await redis.get<EscrowRecord>(escrowKey(taskId));
  let escrowKeypair: Keypair;

  if (!record) {
    escrowKeypair = Keypair.generate();
    record = {
      taskId,
      account: escrowKeypair.publicKey.toBase58(),
      secret: bs58.encode(escrowKeypair.secretKey),
      balanceLamports: 0,
      createdAt: now,
      updatedAt: now,
    };
  } else {
    escrowKeypair = Keypair.fromSecretKey(bs58.decode(record.secret));
  }

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: requesterWallet.keypair.publicKey,
      toPubkey: escrowKeypair.publicKey,
      lamports: amountLamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [
    requesterWallet.keypair,
  ]);

  record.balanceLamports += amountLamports;
  record.updatedAt = nowIso();
  await redis.set(escrowKey(taskId), record);

  await recordPaymentEvent({
    id: uuid(),
    taskId,
    txSignature: signature,
    amountLamports,
    direction: "escrow_fund",
    createdAt: nowIso(),
  });

  return deserializeEscrow(record);
};

export const releaseEscrowToWorker = async ({
  taskId,
  workerWallet,
  amountLamports,
  submissionId,
}: {
  taskId: string;
  workerWallet: string | PublicKey;
  amountLamports: number;
  submissionId: string;
}) => {
  const redis = getRedis();
  const connection = getSolanaConnection();
  const escrow = await getEscrowForTask(taskId);
  if (!escrow) {
    throw new Error(`No escrow account for task ${taskId}`);
  }
  if (escrow.balanceLamports < amountLamports) {
    throw new Error("Insufficient escrow balance.");
  }

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: escrow.keypair.publicKey,
      toPubkey: getPublicKey(workerWallet),
      lamports: amountLamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [
    escrow.keypair,
  ]);

  escrow.balanceLamports -= amountLamports;
  escrow.updatedAt = nowIso();
  await redis.set(escrowKey(taskId), {
    taskId: escrow.taskId,
    account: escrow.account,
    secret: bs58.encode(escrow.keypair.secretKey),
    balanceLamports: escrow.balanceLamports,
    createdAt: escrow.createdAt,
    updatedAt: escrow.updatedAt,
  });

  await recordPaymentEvent({
    id: uuid(),
    taskId,
    submissionId,
    txSignature: signature,
    amountLamports,
    direction: "release_to_worker",
    createdAt: nowIso(),
  });

  return signature;
};

export const refundEscrowToRequester = async ({
  taskId,
  requesterWallet,
  amountLamports,
  submissionId,
}: {
  taskId: string;
  requesterWallet: string | PublicKey;
  amountLamports: number;
  submissionId?: string;
}) => {
  const redis = getRedis();
  const connection = getSolanaConnection();
  const escrow = await getEscrowForTask(taskId);
  if (!escrow) {
    throw new Error(`No escrow account for task ${taskId}`);
  }
  if (escrow.balanceLamports < amountLamports) {
    throw new Error("Insufficient escrow balance for refund.");
  }

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: escrow.keypair.publicKey,
      toPubkey: getPublicKey(requesterWallet),
      lamports: amountLamports,
    })
  );

  const signature = await sendAndConfirmTransaction(connection, tx, [
    escrow.keypair,
  ]);

  escrow.balanceLamports -= amountLamports;
  escrow.updatedAt = nowIso();
  await redis.set(escrowKey(taskId), {
    taskId: escrow.taskId,
    account: escrow.account,
    secret: bs58.encode(escrow.keypair.secretKey),
    balanceLamports: escrow.balanceLamports,
    createdAt: escrow.createdAt,
    updatedAt: escrow.updatedAt,
  });

  await recordPaymentEvent({
    id: uuid(),
    taskId,
    submissionId,
    txSignature: signature,
    amountLamports,
    direction: "refund_requester",
    createdAt: nowIso(),
  });

  return signature;
};

