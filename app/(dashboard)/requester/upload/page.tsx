"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import toast from "react-hot-toast";
<<<<<<< HEAD
=======
import { uploadData } from "aws-amplify/storage";
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
=======
import { publicEnv } from "@/lib/env";
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
import { formatLamports, solToLamports } from "@/lib/utils";

interface CsvPreviewState {
  rows: Array<Record<string, string>>;
  rowCount: number;
  previewLines: string[];
}

const initialPreviewState: CsvPreviewState = {
  rows: [],
  rowCount: 0,
  previewLines: [],
};

export default function UploadTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [pricePerEntrySol, setPricePerEntrySol] = useState("0.02");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvState, setCsvState] = useState<CsvPreviewState>(initialPreviewState);
<<<<<<< HEAD
  const [csvRaw, setCsvRaw] = useState("");
=======
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalLamports = useMemo(() => {
    const price = Number(pricePerEntrySol || 0);
    if (!price || !csvState.rowCount) return 0;
    return solToLamports(price) * csvState.rowCount;
  }, [csvState.rowCount, pricePerEntrySol]);

<<<<<<< HEAD
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
=======
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file.");
      return;
    }
    setCsvFile(file);
<<<<<<< HEAD
    try {
      const text = await file.text();
      setCsvRaw(text);
      Papa.parse<Record<string, string>>(text, {
=======
    Papa.parse<Record<string, string>>(file, {
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.filter(Boolean);
        const previewLines = rows.slice(0, 5).map((row, idx) => {
          const values = Object.entries(row)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" · ");
          return `#${idx + 1} ${values}`;
        });
        setCsvState({
          rows,
          rowCount: rows.length,
          previewLines,
        });
      },
<<<<<<< HEAD
        error: () => toast.error("Unable to parse CSV. Please check the format."),
    });
    } catch {
      toast.error("Unable to read file contents.");
    }
=======
      error: () => toast.error("Unable to parse CSV. Please check the format."),
    });
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  };

  const handleSubmit = async () => {
    if (!csvFile) {
      toast.error("Upload a CSV first.");
      return;
    }
    if (!csvState.rowCount) {
      toast.error("We couldn't detect rows inside the CSV.");
      return;
    }
    if (!pricePerEntrySol) {
      toast.error("Set a price per entry.");
      return;
    }
<<<<<<< HEAD
    if (!csvRaw) {
      toast.error("File contents missing. Re-upload the CSV.");
      return;
    }

    setIsSubmitting(true);
    try {
      const mockUpload = await fetch("/api/mock-uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: csvFile.name,
          content: csvRaw,
        }),
      });

      if (!mockUpload.ok) {
        const payload = await mockUpload.json().catch(() => ({}));
        throw new Error(payload.error ?? "Mock storage failed.");
      }

      const { key } = await mockUpload.json();
=======

    setIsSubmitting(true);
    try {
      const storagePath = `${
        publicEnv.amplifyBucketPrefix ?? "uploads/"
      }requesters/${Date.now()}-${csvFile.name}`;
      await uploadData({
        data: csvFile,
        path: storagePath,
        options: {
          contentType: csvFile.type || "text/csv",
        },
      }).result;
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          instructions,
<<<<<<< HEAD
          csvKey: key,
=======
          csvKey: storagePath,
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
          csvFileName: csvFile.name,
          csvPreview: csvState.previewLines,
          rowCount: csvState.rowCount,
          pricePerRowLamports: solToLamports(Number(pricePerEntrySol)),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Failed to create task.");
      }

      const task = await response.json();
      toast.success("Task created. Escrow funding comes next.");
      router.push(`/requester/review/${task.id ?? ""}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Requester</p>
        <h1 className="text-3xl font-semibold text-[var(--color-navy-900)]">
          Upload CSV and scope your task
        </h1>
        <p className="text-sm text-gray-600">
<<<<<<< HEAD
          For now we mock file storage so you can scope a task without wiring S3/Amplify.
=======
          We store files in Amplify Storage, hydrate Redis metadata, and prep Solana escrow
          in one flow.
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
        </p>
      </div>

      <Card className="space-y-4">
        <Input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          rows={4}
          placeholder="Instructions for labelers"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <label className="flex w-full flex-col gap-2 rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
          <span className="font-medium text-[var(--color-navy-900)]">CSV file</span>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          {csvFile && (
            <div className="text-xs text-gray-500">
              {csvFile.name} • {csvState.rowCount} rows detected
            </div>
          )}
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-gray-600">
            <span className="font-medium text-[var(--color-navy-900)]">
              Price per entry (◎)
            </span>
            <Input
              type="number"
              min="0"
              step="0.001"
              value={pricePerEntrySol}
              onChange={(e) => setPricePerEntrySol(e.target.value)}
            />
          </label>
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Escrow total</p>
            <p className="text-2xl font-semibold text-[var(--color-navy-900)]">
              {totalLamports ? formatLamports(totalLamports) : "—"}
            </p>
            <p className="text-xs text-gray-500">
              {csvState.rowCount} entries x {pricePerEntrySol || 0} ◎
            </p>
          </div>
        </div>
        {csvState.previewLines.length > 0 && (
          <div className="space-y-2 rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Preview
            </p>
            <ul className="space-y-1 text-xs text-gray-600">
              {csvState.previewLines.map((line) => (
                <li key={line} className="rounded-xl bg-white p-2">{line}</li>
              ))}
            </ul>
          </div>
        )}
        <Button
          className="w-full"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!csvFile || !title || !instructions}
        >
          Create task
        </Button>
      </Card>
    </div>
  );
}

