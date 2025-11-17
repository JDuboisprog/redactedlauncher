"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import type { SubmissionRecord, TaskRecord } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLamports } from "@/lib/utils";

interface SubmissionReviewPanelProps {
  taskId: string;
  submissions: SubmissionRecord[];
  task: TaskRecord;
}

const statusTone: Record<SubmissionRecord["status"], "info" | "success" | "warning" | "danger" | "neutral"> = {
  draft: "neutral",
  in_progress: "neutral",
  submitted: "info",
  approved: "success",
  denied: "danger",
  disputed: "warning",
};

export function SubmissionReviewPanel({
  taskId,
  submissions,
  task,
}: SubmissionReviewPanelProps) {
  const [localSubmissions, setLocalSubmissions] = useState(submissions);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAction = async (
    submissionId: string,
    status: SubmissionRecord["status"]
  ) => {
    if (status === "approved") {
      try {
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "release", taskId, submissionId }),
        });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Unable to release escrow.");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Escrow release failed.");
        return;
      }
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to update submission.");
      }
      const payload = await response.json();
      setLocalSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === submissionId ? payload.submission : submission
        )
      );
      toast.success(
        status === "approved"
          ? "Submission approved."
          : status === "denied"
          ? "Submission denied."
          : "Submission updated."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (localSubmissions.length === 0) {
    return (
      <Card className="text-sm text-gray-600">
        No submissions yet. Workers will appear here once they send entries.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {localSubmissions.map((submission) => (
        <Card key={submission.id} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Worker · {submission.workerWallet.slice(0, 6)}…
              </p>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-[var(--color-navy-900)]">
                  Submission {submission.id.slice(0, 6)}
                </h3>
                <Badge tone={statusTone[submission.status]}>{submission.status}</Badge>
              </div>
            </div>
            <div className="flex gap-2 text-sm text-gray-500">
              <span>{submission.entries.length} entries</span>
              <span>Updated {new Date(submission.updatedAt).toLocaleString()}</span>
              <span>
                {formatLamports(
                  submission.entries.length * task.pricePerRowLamports
                )}
              </span>
            </div>
          </div>
          <div className="grid gap-2 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
            {submission.entries.slice(0, 3).map((entry) => (
              <div key={`${submission.id}-${entry.rowIndex}`} className="rounded-2xl bg-white p-3 text-xs">
                <p className="font-semibold text-[var(--color-navy-900)]">
                  Row {entry.rowIndex + 1}
                </p>
                <p>{entry.label}</p>
              </div>
            ))}
            {submission.entries.length > 3 && (
              <p className="text-xs text-gray-500">
                +{submission.entries.length - 3} more entries
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => handleAction(submission.id, "denied")}
              isLoading={isUpdating}
            >
              Request changes
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full text-[var(--color-navy-500)]"
            >
              <Link
                href={`/requester/disputes/new?taskId=${task.id}&submissionId=${submission.id}`}
              >
                Open dispute
              </Link>
            </Button>
            <Button
              className="w-full"
              onClick={() => handleAction(submission.id, "approved")}
              isLoading={isUpdating}
            >
              Approve & release escrow
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

