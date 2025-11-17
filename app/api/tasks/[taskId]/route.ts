import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import {
  assignWorkerToTask,
  getTaskById,
  incrementTaskCounters,
  listTaskSubmissions,
  updateTaskStatus,
} from "@/lib/redisTasks";

const updateSchema = z.object({
  status: z
    .enum([
      "draft",
      "funding",
      "active",
      "in_review",
      "completed",
      "denied",
      "disputed",
    ])
    .optional(),
  workerId: z.string().optional(),
  workerWallet: z.string().optional(),
  validatedRows: z.number().int().nonnegative().optional(),
  paidLamports: z.number().int().nonnegative().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const { searchParams } = new URL(request.url);
  const includeSubmissions = searchParams.get("include") === "submissions";
  const task = await getTaskById(params.taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (includeSubmissions) {
    const submissions = await listTaskSubmissions(task.id);
    return NextResponse.json({ task, submissions });
  }

  return NextResponse.json({ task });
}

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const updates = parsed.data;
  let task = await getTaskById(params.taskId);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (updates.workerId && updates.workerWallet) {
    task = await assignWorkerToTask({
      taskId: task.id,
      workerId: updates.workerId,
      workerWallet: updates.workerWallet,
    });
  }

  if (typeof updates.validatedRows === "number" || typeof updates.paidLamports === "number") {
    task = (await incrementTaskCounters(task.id, {
      validatedRows: updates.validatedRows ?? 0,
      paidLamports: updates.paidLamports ?? 0,
    }))!;
  }

  if (updates.status) {
    task = (await updateTaskStatus(task.id, updates.status))!;
  }

  return NextResponse.json({ task, updatedBy: user.id });
}

