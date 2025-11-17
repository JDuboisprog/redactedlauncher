"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import type { DisputeRecord } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AdminDisputesTableProps {
  disputes: DisputeRecord[];
}

const resolutionOptions: Array<DisputeRecord["status"]> = [
  "resolved_worker",
  "resolved_requester",
  "refunded",
];

export function AdminDisputesTable({ disputes }: AdminDisputesTableProps) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statuses, setStatuses] = useState<
    Record<string, DisputeRecord["status"]>
  >({});
  const [activeDispute, setActiveDispute] = useState<string | null>(null);

  const handleResolve = async (disputeId: string) => {
    const resolutionNote = notes[disputeId];
    const status = statuses[disputeId] ?? "resolved_worker";
    if (!resolutionNote) {
      toast.error("Add a resolution note.");
      return;
    }
    setActiveDispute(disputeId);
    try {
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolutionNote }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to resolve dispute.");
      }
      toast.success("Dispute resolved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setActiveDispute(null);
    }
  };

  if (disputes.length === 0) {
    return <Card className="text-sm text-gray-600">No disputes on file.</Card>;
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <Card key={dispute.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Task {dispute.taskId.slice(0, 6)}
              </p>
              <h3 className="text-lg font-semibold text-[var(--color-navy-900)]">
                {dispute.reason}
              </h3>
            </div>
            <span className="text-sm text-gray-500">{dispute.status}</span>
          </div>
          <div className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wide">Resolution</span>
              <select
                value={statuses[dispute.id] ?? "resolved_worker"}
                onChange={(e) =>
                  setStatuses((prev) => ({
                    ...prev,
                    [dispute.id]: e.target.value as DisputeRecord["status"],
                  }))
                }
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm"
              >
                {resolutionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <Textarea
              rows={3}
              placeholder="Add resolution note"
              value={notes[dispute.id] ?? ""}
              onChange={(e) =>
                setNotes((prev) => ({ ...prev, [dispute.id]: e.target.value }))
              }
            />
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleResolve(dispute.id)}
            isLoading={activeDispute === dispute.id}
          >
            Finalize decision
          </Button>
        </Card>
      ))}
    </div>
  );
}

