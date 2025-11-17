import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import {
  fundEscrowFromRequester,
  listPaymentEvents,
  refundEscrowToRequester,
  releaseEscrowToWorker,
} from "@/lib/solanaEscrow";
import {
  getSubmission,
  getTaskById,
  incrementTaskCounters,
  saveTask,
  updateSubmissionStatus,
} from "@/lib/redisTasks";

const paymentSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("fund"),
    taskId: z.string(),
    amountLamports: z.number().int().positive().optional(),
  }),
  z.object({
    action: z.literal("release"),
    taskId: z.string(),
    submissionId: z.string(),
  }),
  z.object({
    action: z.literal("refund"),
    taskId: z.string(),
    submissionId: z.string(),
    amountLamports: z.number().int().positive().optional(),
  }),
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) {
    return NextResponse.json({ error: "taskId is required" }, { status: 400 });
  }
  const events = await listPaymentEvents(taskId);
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const body = await request.json().catch(() => null);
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const payload = parsed.data;
  const task = await getTaskById(payload.taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (user.role === "worker" && payload.action !== "release") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  switch (payload.action) {
    case "fund": {
      if (user.role !== "requester" || task.requesterId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const amount =
        payload.amountLamports ?? task.totalEscrowLamports - task.paidLamports;
      const escrow = await fundEscrowFromRequester({
        taskId: task.id,
        requesterId: user.id,
        amountLamports: amount,
      });
      task.escrowAccount = escrow.account;
      if (task.status === "funding") {
        task.status = "active";
      }
      await saveTask(task);
      return NextResponse.json({
        escrowAccount: escrow.account,
        balanceLamports: escrow.balanceLamports,
      });
    }
    case "release": {
      if (user.role !== "requester" && user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const submission = await getSubmission(payload.submissionId);
      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }
      if (submission.status !== "submitted") {
        return NextResponse.json(
          { error: "Submission must be submitted before release." },
          { status: 400 }
        );
      }
      const amountLamports = submission.entries.length * task.pricePerRowLamports;
      const signature = await releaseEscrowToWorker({
        taskId: task.id,
        submissionId: submission.id,
        workerWallet: submission.workerWallet,
        amountLamports,
      });
      await updateSubmissionStatus(submission.id, "approved");
      await incrementTaskCounters(task.id, {
        validatedRows: submission.entries.length,
        paidLamports: amountLamports,
      });
      return NextResponse.json({ txSignature: signature, amountLamports });
    }
    case "refund": {
      if (user.role !== "requester" && user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const submission = await getSubmission(payload.submissionId);
      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }
      const amountLamports =
        payload.amountLamports ??
        submission.entries.length * task.pricePerRowLamports;
      const signature = await refundEscrowToRequester({
        taskId: task.id,
        requesterWallet: task.requesterWallet,
        amountLamports,
        submissionId: submission.id,
      });
      await updateSubmissionStatus(submission.id, "denied");
      await incrementTaskCounters(task.id, { disputeCount: 1 });
      return NextResponse.json({ txSignature: signature, amountLamports });
    }
    default:
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }
}

