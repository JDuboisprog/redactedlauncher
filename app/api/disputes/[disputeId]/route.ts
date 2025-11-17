import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import {
  getDisputeById,
  resolveDispute,
} from "@/lib/disputes";
import { getSubmission, getTaskById } from "@/lib/redisTasks";
import { refundEscrowToRequester, releaseEscrowToWorker } from "@/lib/solanaEscrow";

const resolveSchema = z.object({
  status: z.enum(["resolved_requester", "resolved_worker", "refunded"]),
  resolutionNote: z.string().min(5),
});

export async function GET(
  _request: Request,
  { params }: { params: { disputeId: string } }
) {
  const dispute = await getDisputeById(params.disputeId);
  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }
  return NextResponse.json({ dispute });
}

export async function PATCH(
  request: Request,
  { params }: { params: { disputeId: string } }
) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admin role required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resolveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const dispute = await getDisputeById(params.disputeId);
  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 });
  }

  const task = await getTaskById(dispute.taskId);
  const submission = await getSubmission(dispute.submissionId);
  if (!task || !submission) {
    return NextResponse.json(
      { error: "Linked task or submission missing." },
      { status: 422 }
    );
  }

  if (parsed.data.status === "resolved_worker") {
    await releaseEscrowToWorker({
      taskId: task.id,
      submissionId: submission.id,
      workerWallet: submission.workerWallet,
      amountLamports: submission.entries.length * task.pricePerRowLamports,
    });
  } else {
    await refundEscrowToRequester({
      taskId: task.id,
      requesterWallet: task.requesterWallet,
      amountLamports: submission.entries.length * task.pricePerRowLamports,
      submissionId: submission.id,
    });
  }

  const updated = await resolveDispute(
    dispute.id,
    parsed.data.status,
    parsed.data.resolutionNote,
    user.id
  );

  return NextResponse.json({ dispute: updated });
}

