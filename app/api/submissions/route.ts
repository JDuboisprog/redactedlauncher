import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import {
  listTaskSubmissions,
  listWorkerSubmissions,
  saveSubmission,
} from "@/lib/redisTasks";
import { nowIso } from "@/lib/utils";

const entrySchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  payload: z.record(z.string(), z.string()),
  label: z.string(),
  confidence: z.number().min(0).max(1),
  updatedAt: z.string().optional(),
});

const submissionSchema = z.object({
  submissionId: z.string().optional(),
  taskId: z.string(),
  entries: z.array(entrySchema),
  note: z.string().optional(),
  fileKey: z.string().optional(),
  status: z
    .enum(["draft", "in_progress", "submitted", "approved", "denied", "disputed"])
    .optional(),
});

export async function GET(request: Request) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  if (taskId) {
    const submissions = await listTaskSubmissions(taskId);
    return NextResponse.json({ submissions });
  }

  const submissions = await listWorkerSubmissions(user.id);
  return NextResponse.json({ submissions });
}

export async function POST(request: Request) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  if (user.role !== "worker") {
    return NextResponse.json(
      { error: "Only workers can submit labels." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const submission = await saveSubmission({
    ...parsed.data,
    workerId: user.id,
    workerWallet: user.walletAddress,
    entries: parsed.data.entries.map((entry) => ({
      ...entry,
      updatedAt: entry.updatedAt ?? nowIso(),
    })),
  });

  return NextResponse.json({ submission });
}

