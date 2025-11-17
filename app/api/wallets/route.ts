import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getOrCreateWallet } from "@/lib/solanaWallets";

export async function GET() {
<<<<<<< HEAD
  const user = await getCurrentUser();
=======
  const user = getCurrentUser();
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
  const wallet = await getOrCreateWallet(user.id, user.role);
  return NextResponse.json({ wallet: wallet.metadata });
}

