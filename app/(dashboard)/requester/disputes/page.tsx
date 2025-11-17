import Link from "next/link";

import { listDisputesForUser } from "@/lib/disputes";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function RequesterDisputesPage() {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const disputes = await listDisputesForUser(user.id);

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Requester</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Disputes
        </h1>
        <p className="text-sm text-gray-600">
          Track every escalation and monitor admin resolutions from one thread.
        </p>
      </div>

      <div className="grid gap-4">
        {disputes.length === 0 && (
          <Card className="text-sm text-gray-600">
            No disputes right now. You can open one while reviewing a submission.
          </Card>
        )}
        {disputes.map((dispute) => (
          <Card key={dispute.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Task {dispute.taskId.slice(0, 6)} · Submission {dispute.submissionId.slice(0, 6)}
                </p>
                <h2 className="text-lg font-semibold text-[var(--color-navy-900)]">
                  {dispute.reason.slice(0, 90)}
                </h2>
              </div>
              <Badge tone={dispute.status === "open" ? "warning" : "success"}>
                {dispute.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Opened {new Date(dispute.createdAt).toLocaleString()}
            </p>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href={`/requester/disputes/${dispute.id}`}>View thread</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

