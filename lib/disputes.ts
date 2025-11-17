import { v4 as uuid } from "uuid";

import { getRedis } from "@/lib/redis";
import { recordDisputeIndex } from "@/lib/redisTasks";
import type { DisputeRecord, DisputeStatus } from "@/lib/types";
import { nowIso } from "@/lib/utils";

const disputeKey = (id: string) => `disputes:${id}`;
const disputeIndexKey = (taskId: string) => `disputes:task:${taskId}`;
const disputeGlobalIndexKey = "disputes:index";
const userDisputeIndexKey = (userId: string) => `disputes:user:${userId}`;

export interface CreateDisputePayload {
  taskId: string;
  submissionId: string;
  raisedBy: DisputeRecord["raisedBy"];
  raisedById: string;
  reason: string;
  evidenceKeys?: string[];
  participantUserIds: string[];
}

export const createDispute = async (
  payload: CreateDisputePayload
): Promise<DisputeRecord> => {
  const redis = getRedis();
  const now = nowIso();
  const dispute: DisputeRecord = {
    id: uuid(),
    taskId: payload.taskId,
    submissionId: payload.submissionId,
    raisedBy: payload.raisedBy,
    raisedById: payload.raisedById,
    reason: payload.reason,
    evidenceKeys: payload.evidenceKeys ?? [],
    status: "open",
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(disputeKey(dispute.id), dispute);
  await recordDisputeIndex(dispute);
  await redis.zadd(disputeGlobalIndexKey, {
    score: Date.now(),
    member: dispute.id,
  });
  await Promise.all(
    payload.participantUserIds.map((userId) =>
      redis.zadd(userDisputeIndexKey(userId), {
        score: Date.now(),
        member: dispute.id,
      })
    )
  );
  return dispute;
};

export const listDisputesForTask = async (taskId: string) => {
  const redis = getRedis();
  const ids = await redis.zrange(disputeIndexKey(taskId), 0, -1, { rev: true });
  const disputes = await Promise.all(
    ids.map((id) => redis.get<DisputeRecord>(disputeKey(id)))
  );
  return disputes.filter(Boolean) as DisputeRecord[];
};

export const listDisputesForUser = async (userId: string) => {
  const redis = getRedis();
  const ids = await redis.zrange(userDisputeIndexKey(userId), 0, -1, {
    rev: true,
  });
  const disputes = await Promise.all(
    ids.map((id) => redis.get<DisputeRecord>(disputeKey(id)))
  );
  return disputes.filter(Boolean) as DisputeRecord[];
};

export const listAllDisputes = async () => {
  const redis = getRedis();
  const ids = await redis.zrange(disputeGlobalIndexKey, 0, -1, { rev: true });
  const disputes = await Promise.all(
    ids.map((id) => redis.get<DisputeRecord>(disputeKey(id)))
  );
  return disputes.filter(Boolean) as DisputeRecord[];
};

export const getDisputeById = async (disputeId: string) => {
  const redis = getRedis();
  return (await redis.get<DisputeRecord>(disputeKey(disputeId))) ?? null;
};

export const resolveDispute = async (
  disputeId: string,
  status: DisputeStatus,
  resolutionNote: string,
  resolvedBy: string
) => {
  const redis = getRedis();
  const dispute = await redis.get<DisputeRecord>(disputeKey(disputeId));
  if (!dispute) return null;
  dispute.status = status;
  dispute.resolutionNote = resolutionNote;
  dispute.resolvedBy = resolvedBy;
  dispute.updatedAt = nowIso();
  await redis.set(disputeKey(disputeId), dispute);
  return dispute;
};

