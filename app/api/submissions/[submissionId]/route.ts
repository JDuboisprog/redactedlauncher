import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { getSubmission, updateSubmissionStatus } from "@/lib/redisTasks";

const updateSchema = z.object({
  status: z.enum([
    "draft",
    "in_progress",
    "submitted",
    "approved",
    "denied",
    "disputed",
  ]),
});

export async function GET(
  _request: Request,
  { params }: { params: { submissionId: string } }
) {
  const submission = await getSubmission(params.submissionId);
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  return NextResponse.json({ submission });
}

export async function PATCH(
  request: Request,
  { params }: { params: { submissionId: string } }
) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  if (user.role !== "requester" && user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const submission = await updateSubmissionStatus(
    params.submissionId,
    parsed.data.status
  );
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  return NextResponse.json({ submission });
}

