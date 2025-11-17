import { notFound } from "next/navigation";

import { LabelWorkspace } from "@/components/workspace/label-workspace";
import { getCurrentUser } from "@/lib/auth";
import { getTaskById, listTaskSubmissions } from "@/lib/redisTasks";
import { getOrCreateWallet } from "@/lib/solanaWallets";

export default async function TaskWorkspacePage({
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
  if (!task) {
    notFound();
  }
  const [submissions, wallet] = await Promise.all([
    listTaskSubmissions(task.id),
    getOrCreateWallet(user.id, "worker"),
  ]);
  const existing = submissions.find((submission) => submission.workerId === user.id);

  return (
    <LabelWorkspace
      task={task}
      workerId={user.id}
      workerWallet={wallet.metadata.address}
      existingSubmission={existing}
    />
  );
}

