"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { getUrl } from "aws-amplify/storage";

import type { SubmissionRecord, TaskRecord } from "@/lib/types";
import { nowIso } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LabelWorkspaceProps {
  task: TaskRecord;
  workerId: string;
  workerWallet: string;
  existingSubmission?: SubmissionRecord | null;
}

type EntryDraft = { label: string; confidence: number };

export function LabelWorkspace({
  task,
  workerId,
  workerWallet,
  existingSubmission,
}: LabelWorkspaceProps) {
  const router = useRouter();
  const [rows, setRows] = useState<Array<Record<string, string>>>([]);
  const [activeIndex, setActiveIndex] = useState(
    existingSubmission?.entries.at(-1)?.rowIndex ?? 0
  );
  const [drafts, setDrafts] = useState<Record<number, EntryDraft>>(() => {
    if (!existingSubmission) return {};
    return existingSubmission.entries.reduce<Record<number, EntryDraft>>((acc, entry) => {
      acc[entry.rowIndex] = {
        label: entry.label,
        confidence: entry.confidence,
      };
      return acc;
    }, {});
  });
  const [notes, setNotes] = useState(existingSubmission?.note ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = useMemo(
    () => Object.keys(drafts).length,
    [drafts]
  );

  useEffect(() => {
    const claimTask = async () => {
      if (task.workerId && task.workerId !== workerId) return;
      try {
        await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workerId, workerWallet }),
        });
      } catch {
        toast.error("Unable to register you as the active worker.");
      }
    };
    claimTask();
  }, [task.id, task.workerId, workerId, workerWallet]);

  useEffect(() => {
    const loadCsv = async () => {
      try {
<<<<<<< HEAD
        let text: string;
        if (task.csvKey.startsWith("mock://")) {
          const response = await fetch(
            `/api/mock-uploads?key=${encodeURIComponent(task.csvKey)}`
          );
          if (!response.ok) {
            throw new Error("Mock CSV not found.");
          }
          text = await response.text();
        } else {
          const { url } = await getUrl({
            path: task.csvKey,
            expiresIn: 600,
          });
          const response = await fetch(url.toString());
          text = await response.text();
        }
=======
        const { url } = await getUrl({
          path: task.csvKey,
          expiresIn: 600,
        });
        const response = await fetch(url.toString());
        const text = await response.text();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
        const parsed = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });
        const data = parsed.data.filter(Boolean);
        setRows(data);
      } catch {
        toast.error("Could not load CSV rows. Check bucket permissions.");
      }
    };
    loadCsv();
  }, [task.csvKey]);

  const currentRow = rows[activeIndex];
  const currentDraft = drafts[activeIndex] ?? { label: "", confidence: 0.9 };

  const updateDraft = (rowIndex: number, partial: Partial<EntryDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        ...partial,
      },
    }));
  };

  const handleSubmit = async (status: "in_progress" | "submitted") => {
    if (!rows.length) {
      toast.error("Rows are still loading.");
      return;
    }
    if (status === "submitted" && completedCount === 0) {
      toast.error("Label at least one row before submitting.");
      return;
    }

    setIsSaving(true);
    try {
      const entries = Object.entries(drafts).map(([rowIndex, value]) => ({
        rowIndex: Number(rowIndex),
        payload: rows[Number(rowIndex)],
        label: value.label,
        confidence: value.confidence,
        updatedAt: nowIso(),
      }));

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: existingSubmission?.id,
          taskId: task.id,
          entries,
          note: notes,
          status,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to save submission.");
      }

      toast.success(status === "submitted" ? "Submission sent for review." : "Draft saved.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToNext = () => {
    setActiveIndex((index) => Math.min(index + 1, Math.max(rows.length - 1, 0)));
  };
  const goToPrev = () => {
    setActiveIndex((index) => Math.max(index - 1, 0));
  };

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Workspace</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          {task.title}
        </h1>
        <p className="text-sm text-gray-600">{task.instructions}</p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Progress
          </p>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{completedCount} / {rows.length || task.rowCount} entries labeled</span>
            <span>{Math.round((completedCount / (rows.length || task.rowCount || 1)) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-[var(--color-navy-500)] transition-all"
              style={{
                width: `${
                  Math.min(
                    100,
                    (completedCount / (rows.length || task.rowCount || 1)) * 100
                  ) || 0
                }%`,
              }}
            />
          </div>
        </div>

        {currentRow ? (
          <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
              <span>
                Entry {activeIndex + 1} / {rows.length || task.rowCount}
              </span>
              <span>Confidence: {(currentDraft.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              {Object.entries(currentRow).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl bg-white px-3 py-2"
                >
                  <span className="font-medium text-[var(--color-navy-900)]">{key}</span>
                  <span className="text-right text-gray-600">{value}</span>
                </div>
              ))}
            </div>
            <Textarea
              rows={3}
              placeholder="Enter label or answer for this entry"
              value={currentDraft.label}
              onChange={(e) => updateDraft(activeIndex, { label: e.target.value })}
            />
            <label className="text-sm text-gray-600">
              Confidence
              <Input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={currentDraft.confidence}
                onChange={(e) =>
                  updateDraft(activeIndex, { confidence: Number(e.target.value) })
                }
              />
            </label>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={goToPrev} disabled={activeIndex === 0}>
                Previous
              </Button>
              <Button variant="secondary" onClick={goToNext} disabled={activeIndex >= (rows.length || 1) - 1}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading CSV rows…</p>
        )}

        <Textarea
          rows={4}
          placeholder="Notes for the requester (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => handleSubmit("in_progress")}
            isLoading={isSaving}
          >
            Save draft
          </Button>
          <Button
            className="w-full"
            onClick={() => handleSubmit("submitted")}
            isLoading={isSaving}
            disabled={completedCount === 0}
          >
            Submit for review
          </Button>
        </div>
      </Card>
    </div>
  );
}

