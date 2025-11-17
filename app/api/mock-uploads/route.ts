import { NextResponse } from "next/server";
import { z } from "zod";

import { getMockCsv, saveMockCsv } from "@/lib/mockStorage";

const uploadSchema = z.object({
  fileName: z.string().min(1),
  content: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = uploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const record = await saveMockCsv(parsed.data.fileName, parsed.data.content);
  return NextResponse.json({ key: `mock://${record.id}` });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key?.startsWith("mock://")) {
    return NextResponse.json({ error: "Missing mock key." }, { status: 400 });
  }
  const id = key.replace("mock://", "");
  const record = await getMockCsv(id);
  if (!record) {
    return NextResponse.json({ error: "Mock CSV not found." }, { status: 404 });
  }

  return new NextResponse(record.content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "X-Mock-Filename": record.fileName,
    },
  });
}

