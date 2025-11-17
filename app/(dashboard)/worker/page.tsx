import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { listOpenTasks } from "@/lib/redisTasks";
import { formatLamports } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateWallet } from "@/lib/solanaWallets";

export default async function WorkerDashboardPage() {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const [tasks, wallet] = await Promise.all([
    listOpenTasks(),
    getOrCreateWallet(user.id, "worker"),
  ]);

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Worker</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Available labeling tasks
        </h1>
        <p className="text-sm text-gray-600">
          Claim a CSV, work entry-by-entry, and release escrow the minute your submission is approved.
        </p>
      </div>

      <Card className="space-y-2 bg-gray-50 text-sm text-gray-600">
        <p className="text-xs uppercase tracking-wide text-gray-500">Your wallet</p>
        <p className="font-mono text-[var(--color-navy-900)]">
          {wallet.metadata.address}
        </p>
        <p className="text-xs text-gray-500">
          Funds land here after approvals. Add it to Phantom to track payouts.
        </p>
      </Card>

      <div className="grid gap-4">
        {tasks.length === 0 && (
          <Card className="text-center text-sm text-gray-600">
            No open tasks yet. Check back soon!
          </Card>
        )}
        {tasks.map((task) => (
          <Card key={task.id} className="flex flex-col gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {task.rowCount} entries · {task.csvFileName}
              </p>
              <h2 className="text-lg font-semibold text-[var(--color-navy-900)]">
                {task.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2">{task.instructions}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-2xl bg-gray-50 px-4 py-2 text-sm text-gray-600">
                {formatLamports(task.pricePerRowLamports)} per entry
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/tasks/${task.id}`}>
                  Open workspace <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

