import { v4 as uuid } from "uuid";

import { getRedis } from "@/lib/redis";
import {
  DisputeRecord,
  LabelEntry,
  SubmissionRecord,
  SubmissionStatus,
  TaskRecord,
  TaskStatus,
} from "@/lib/types";
import { nowIso } from "@/lib/utils";

const taskKey = (id: string) => `tasks:${id}`;
const submissionKey = (id: string) => `submissions:${id}`;
const taskIndexKey = "tasks:index";
const requesterIndexKey = (id: string) => `tasks:requester:${id}`;
const workerIndexKey = (id: string) => `tasks:worker:${id}`;
const submissionIndexKey = (taskId: string) => `submissions:task:${taskId}`;
const workerSubmissionIndexKey = (workerId: string) =>
  `submissions:worker:${workerId}`;
const disputeIndexKey = (taskId: string) => `disputes:task:${taskId}`;

export interface CreateTaskPayload {
  title: string;
  instructions: string;
  csvKey: string;
  csvFileName: string;
  csvPreview: string[];
  rowCount: number;
  pricePerRowLamports: number;
  requesterId: string;
  requesterWallet: string;
}

export const createTaskRecord = async (
  payload: CreateTaskPayload
): Promise<TaskRecord> => {
  const redis = getRedis();
  const now = nowIso();
  const id = uuid();

  const task: TaskRecord = {
    id,
    title: payload.title,
    instructions: payload.instructions,
    csvKey: payload.csvKey,
    csvFileName: payload.csvFileName,
    csvPreview: payload.csvPreview.slice(0, 5),
    rowCount: payload.rowCount,
    pricePerRowLamports: payload.pricePerRowLamports,
    totalEscrowLamports: payload.rowCount * payload.pricePerRowLamports,
    paidLamports: 0,
    requesterId: payload.requesterId,
    requesterWallet: payload.requesterWallet,
    status: "funding",
    submissions: [],
    validatedRows: 0,
    disputeCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(taskKey(id), task);
  await redis.zadd(taskIndexKey, { score: Date.now(), member: id });
  await redis.zadd(requesterIndexKey(payload.requesterId), {
    score: Date.now(),
    member: id,
  });

  return task;
};

export const getTaskById = async (taskId: string) => {
  const redis = getRedis();
  return (await redis.get<TaskRecord>(taskKey(taskId))) ?? null;
};

export const listTasksForRequester = async (requesterId: string) => {
  const redis = getRedis();
  const ids = await redis.zrange(requesterIndexKey(requesterId), 0, -1, {
    rev: true,
  });
  const tasks = await Promise.all(ids.map((id) => redis.get<TaskRecord>(taskKey(id))));
  return tasks.filter(Boolean) as TaskRecord[];
};

export const listOpenTasks = async () => {
  const redis = getRedis();
  const ids = await redis.zrange(taskIndexKey, 0, -1, { rev: true });
  const tasks = await Promise.all(ids.map((id) => redis.get<TaskRecord>(taskKey(id))));
  return (tasks.filter(Boolean) as TaskRecord[]).filter((task) =>
    ["funding", "active", "in_review"].includes(task.status)
  );
};

export const saveTask = async (task: TaskRecord) => {
  const redis = getRedis();
  task.updatedAt = nowIso();
  await redis.set(taskKey(task.id), task);
  return task;
};

export const assignWorkerToTask = async ({
  taskId,
  workerId,
  workerWallet,
}: {
  taskId: string;
  workerId: string;
  workerWallet: string;
}) => {
  const redis = getRedis();
  const task = await getTaskById(taskId);
  if (!task) {
    throw new Error("Task not found");
  }
  task.workerId = workerId;
  task.workerWallet = workerWallet;
  task.status = task.status === "funding" ? "funding" : "active";
  await saveTask(task);
  await redis.zadd(workerIndexKey(workerId), {
    score: Date.now(),
    member: taskId,
  });
  return task;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  const task = await getTaskById(taskId);
  if (!task) return null;
  task.status = status;
  return saveTask(task);
};

export const incrementTaskCounters = async (
  taskId: string,
  {
    validatedRows = 0,
    paidLamports = 0,
    disputeCount = 0,
  }: { validatedRows?: number; paidLamports?: number; disputeCount?: number }
) => {
  const task = await getTaskById(taskId);
  if (!task) return null;
  task.validatedRows += validatedRows;
  task.paidLamports += paidLamports;
  task.disputeCount += disputeCount;
  if (task.validatedRows >= task.rowCount && task.status !== "completed") {
    task.status = "completed";
  }
  return saveTask(task);
};

export interface SubmissionPayload {
  submissionId?: string;
  taskId: string;
  workerId: string;
  workerWallet: string;
  entries: LabelEntry[];
  note?: string;
  fileKey?: string;
  status?: SubmissionStatus;
}

export const saveSubmission = async (
  payload: SubmissionPayload
): Promise<SubmissionRecord> => {
  const redis = getRedis();
  const now = nowIso();
  const submissionId = payload.submissionId ?? uuid();
  const existing = payload.submissionId
    ? await redis.get<SubmissionRecord>(submissionKey(submissionId))
    : null;

  const submission: SubmissionRecord = existing
    ? {
        ...existing,
        entries: payload.entries,
        note: payload.note ?? existing.note,
        fileKey: payload.fileKey ?? existing.fileKey,
        status: payload.status ?? existing.status,
        updatedAt: now,
      }
    : {
        id: submissionId,
        taskId: payload.taskId,
        workerId: payload.workerId,
        workerWallet: payload.workerWallet,
        entries: payload.entries,
        note: payload.note,
        fileKey: payload.fileKey,
        status: payload.status ?? "in_progress",
        createdAt: now,
        updatedAt: now,
      };

  await redis.set(submissionKey(submissionId), submission);
  await redis.zadd(submissionIndexKey(payload.taskId), {
    score: Date.now(),
    member: submissionId,
  });
  await redis.zadd(workerSubmissionIndexKey(payload.workerId), {
    score: Date.now(),
    member: submissionId,
  });

  const task = await getTaskById(payload.taskId);
  if (task && !task.submissions.includes(submissionId)) {
    task.submissions = [...task.submissions, submissionId];
    await saveTask(task);
  }

  return submission;
};

export const updateSubmissionStatus = async (
  submissionId: string,
  status: SubmissionStatus
) => {
  const redis = getRedis();
  const submission = await redis.get<SubmissionRecord>(submissionKey(submissionId));
  if (!submission) return null;
  submission.status = status;
  submission.updatedAt = nowIso();
  await redis.set(submissionKey(submissionId), submission);
  return submission;
};

export const listTaskSubmissions = async (taskId: string) => {
  const redis = getRedis();
  const ids = await redis.zrange(submissionIndexKey(taskId), 0, -1, {
    rev: true,
  });
  const submissions = await Promise.all(
    ids.map((id) => redis.get<SubmissionRecord>(submissionKey(id)))
  );
  return submissions.filter(Boolean) as SubmissionRecord[];
};

export const getSubmission = async (submissionId: string) => {
  const redis = getRedis();
  return (await redis.get<SubmissionRecord>(submissionKey(submissionId))) ?? null;
};

export const listWorkerSubmissions = async (workerId: string) => {
  const redis = getRedis();
  const ids = await redis.zrange(workerSubmissionIndexKey(workerId), 0, -1, {
    rev: true,
  });
  const submissions = await Promise.all(
    ids.map((id) => redis.get<SubmissionRecord>(submissionKey(id)))
  );
  return submissions.filter(Boolean) as SubmissionRecord[];
};

export const recordDisputeIndex = async (dispute: DisputeRecord) => {
  const redis = getRedis();
  await redis.zadd(disputeIndexKey(dispute.taskId), {
    score: Date.now(),
    member: dispute.id,
  });
};

