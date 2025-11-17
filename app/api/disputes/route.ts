import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import {
  createDispute,
  listAllDisputes,
  listDisputesForUser,
} from "@/lib/disputes";
import { getSubmission, getTaskById, updateSubmissionStatus } from "@/lib/redisTasks";

const createDisputeSchema = z.object({
  taskId: z.string(),
  submissionId: z.string(),
  reason: z.string().min(5),
  evidenceKeys: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  const disputes =
    user.role === "admin"
      ? await listAllDisputes()
      : await listDisputesForUser(user.id);
  const filtered = taskId
    ? disputes.filter((dispute) => dispute.taskId === taskId)
    : disputes;
  return NextResponse.json({ disputes: filtered });
}

export async function POST(request: Request) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const body = await request.json().catch(() => null);
  const parsed = createDisputeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const task = await getTaskById(parsed.data.taskId);
  const submission = await getSubmission(parsed.data.submissionId);
  if (!task || !submission) {
    return NextResponse.json({ error: "Task or submission not found" }, { status: 404 });
  }

  const isRequester = user.id === task.requesterId;
  const isWorker = user.id === submission.workerId;
  if (!isRequester && !isWorker && user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const dispute = await createDispute({
    taskId: task.id,
    submissionId: submission.id,
    raisedBy: isWorker ? "worker" : "requester",
    raisedById: user.id,
    reason: parsed.data.reason,
    evidenceKeys: parsed.data.evidenceKeys,
    participantUserIds: [task.requesterId, submission.workerId],
  });
  await updateSubmissionStatus(submission.id, "disputed");

  return NextResponse.json({ dispute }, { status: 201 });
}

