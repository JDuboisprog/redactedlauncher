import Link from "next/link";

import { listTasksForRequester } from "@/lib/redisTasks";
import { getCurrentUser } from "@/lib/auth";
import { formatLamports } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function RequesterDashboardPage() {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const tasks = await listTasksForRequester(user.id);

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Requester</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Your labeling requests
        </h1>
        <p className="text-sm text-gray-600">
          Track funding, submissions, and dispute-ready states per CSV.
        </p>
      </div>

      <div className="grid gap-4">
        {tasks.length === 0 && (
          <Card className="text-sm text-gray-600">No tasks yet. Start by uploading a CSV.</Card>
        )}
        {tasks.map((task) => (
          <Card key={task.id} className="flex flex-col gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {task.rowCount} entries · {task.status}
              </p>
              <h2 className="text-lg font-semibold text-[var(--color-navy-900)]">
                {task.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-2">{task.instructions}</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
              <span>{formatLamports(task.pricePerRowLamports)} per entry</span>
              <Button asChild variant="secondary">
                <Link href={`/requester/review/${task.id}`}>Review submissions</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

