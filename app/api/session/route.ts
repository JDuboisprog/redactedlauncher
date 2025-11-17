import { NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  walletAddress: z
    .string()
    .min(32, "Wallet address looks too short")
    .max(64, "Wallet address looks too long"),
  displayName: z.string().min(2).max(64),
  role: z.enum(["requester", "worker", "admin"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { walletAddress, displayName, role } = parsed.data;
  const userId = `${role}-${walletAddress}`;
  const res = NextResponse.json({ ok: true });

  res.cookies.set("x-user-id", userId, { httpOnly: false, path: "/" });
  res.cookies.set("x-user-role", role, { httpOnly: false, path: "/" });
  res.cookies.set("x-user-wallet", walletAddress, { httpOnly: false, path: "/" });
  res.cookies.set("x-user-name", displayName, { httpOnly: false, path: "/" });

  return res;
}

