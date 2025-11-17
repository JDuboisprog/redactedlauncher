"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewDisputePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId") ?? "";
  const submissionId = searchParams.get("submissionId") ?? "";
  const [reason, setReason] = useState("");
  const [evidenceLink, setEvidenceLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Describe why you're disputing the submission.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          submissionId,
          reason,
          evidenceKeys: evidenceLink ? [evidenceLink] : undefined,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to open dispute.");
      }
      toast.success("Dispute opened.");
      router.push("/requester/disputes");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Requester</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Open a dispute
        </h1>
        <p className="text-sm text-gray-600">
          Reference submission {submissionId.slice(0, 6)} and provide context.
        </p>
      </div>

      <Card className="space-y-4">
        <Input
          placeholder="Task ID"
          value={taskId}
          readOnly
          className="font-mono text-xs"
        />
        <Input
          placeholder="Submission ID"
          value={submissionId}
          readOnly
          className="font-mono text-xs"
        />
        <Textarea
          rows={4}
          placeholder="Reason for the dispute"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Input
          placeholder="Evidence link (Amplify file URL, optional)"
          value={evidenceLink}
          onChange={(e) => setEvidenceLink(e.target.value)}
        />
        <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full">
          Submit dispute
        </Button>
      </Card>
    </div>
  );
}

