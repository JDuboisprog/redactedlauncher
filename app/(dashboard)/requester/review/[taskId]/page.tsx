import { notFound } from "next/navigation";

import { SubmissionReviewPanel } from "@/components/requester/submission-review";
import { EscrowFundingCard } from "@/components/requester/escrow-card";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getTaskById, listTaskSubmissions } from "@/lib/redisTasks";
import { formatLamports } from "@/lib/utils";

export default async function RequesterReviewPage({
  params,
}: {
  params: { taskId: string };
}) {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const task = await getTaskById(params.taskId);
  if (!task || task.requesterId !== user.id) {
    notFound();
  }
  const submissions = await listTaskSubmissions(task.id);

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Requester</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Review submissions
        </h1>
        <p className="text-sm text-gray-600">
          Validate entries, approve payouts, or raise disputes before escrow settles.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="flex flex-col gap-2 rounded-3xl bg-gray-50 p-5 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>{task.title}</span>
            <span className="font-semibold text-[var(--color-navy-900)]">
              {formatLamports(task.pricePerRowLamports)} / entry
            </span>
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-wide">
            <span>{task.rowCount} entries</span>
            <span>Status · {task.status}</span>
          </div>
        </Card>

        <EscrowFundingCard
          taskId={task.id}
          totalEscrowLamports={task.totalEscrowLamports}
          paidLamports={task.paidLamports}
          escrowAccount={task.escrowAccount}
        />
      </div>

      <SubmissionReviewPanel taskId={task.id} submissions={submissions} task={task} />
    </div>
  );
}

