import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import {
  createTaskRecord,
  listOpenTasks,
  listTasksForRequester,
} from "@/lib/redisTasks";
import { getOrCreateWallet } from "@/lib/solanaWallets";

const createTaskSchema = z.object({
  title: z.string().min(3),
  instructions: z.string().min(10),
  csvKey: z.string().min(3),
  csvFileName: z.string(),
  csvPreview: z.array(z.string()).min(1).max(5),
  rowCount: z.number().int().positive(),
  pricePerRowLamports: z.number().int().positive(),
});

export async function GET(request: Request) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view") ?? user.role;

  if (view === "worker") {
    const tasks = await listOpenTasks();
    return NextResponse.json({ tasks });
  }

  const tasks = await listTasksForRequester(user.id);
  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  if (user.role !== "requester") {
    return NextResponse.json(
      { error: "Only requesters can create tasks." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const wallet = await getOrCreateWallet(user.id, "requester");
  const task = await createTaskRecord({
    ...parsed.data,
    requesterId: user.id,
    requesterWallet: wallet.metadata.address,
  });

  return NextResponse.json(task, { status: 201 });
}

