import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getDisputeById } from "@/lib/disputes";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSubmission } from "@/lib/redisTasks";

export default async function WorkerDisputeDetailPage({
  params,
}: {
  params: { disputeId: string };
}) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const dispute = await getDisputeById(params.disputeId);
  if (!dispute) {
    notFound();
  }
  const submission = await getSubmission(dispute.submissionId);
  const isParticipant =
    user.role === "admin" ||
    user.id === dispute.raisedById ||
    (submission && submission.workerId === user.id);
  if (!isParticipant) {
    notFound();
  }

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Worker</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Dispute details
        </h1>
        <p className="text-sm text-gray-600">Submission {dispute.submissionId}</p>
      </div>
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[var(--color-navy-900)]">
            {dispute.reason}
          </span>
          <Badge tone={dispute.status === "open" ? "warning" : "success"}>
            {dispute.status}
          </Badge>
        </div>
        {dispute.resolutionNote && (
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-[var(--color-navy-900)]">Resolution</p>
            <p>{dispute.resolutionNote}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

