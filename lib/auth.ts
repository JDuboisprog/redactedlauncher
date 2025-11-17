import "server-only";

import { cookies, headers } from "next/headers";
import type { UserRole } from "@/lib/types";

export interface PlatformUser {
  id: string;
  role: UserRole;
  walletAddress: string;
  displayName: string;
}

const FALLBACK_USERS: Record<UserRole, PlatformUser> = {
  requester: {
    id: "demo-requester",
    role: "requester",
    walletAddress: "DemoRequesterWallet111111111111111111111111",
    displayName: "Requester Demo",
  },
  worker: {
    id: "demo-worker",
    role: "worker",
    walletAddress: "DemoWorkerWallet11111111111111111111111111",
    displayName: "Labeler Demo",
  },
  admin: {
    id: "demo-admin",
    role: "admin",
    walletAddress: "DemoAdminWallet111111111111111111111111111",
    displayName: "Platform Admin",
  },
};

<<<<<<< HEAD
type HeaderStore = Awaited<ReturnType<typeof headers>> | null;
type CookieStore = Awaited<ReturnType<typeof cookies>> | null;

const safeHeaders = async (): Promise<HeaderStore> => {
  try {
    return await headers();
  } catch {
    return null;
  }
};

const safeCookies = async (): Promise<CookieStore> => {
  try {
    return await cookies();
  } catch {
    return null;
  }
};

const readHeader = (store: HeaderStore, key: string) => store?.get(key) ?? undefined;

const readCookie = (store: CookieStore, key: string) =>
  store?.get(key)?.value ?? undefined;

export const getCurrentUser = async (): Promise<PlatformUser> => {
  const [headerStore, cookieStore] = await Promise.all([safeHeaders(), safeCookies()]);

  const id =
    readHeader(headerStore, "x-user-id") ??
    readCookie(cookieStore, "x-user-id") ??
    FALLBACK_USERS.requester.id;
  const role = (readHeader(headerStore, "x-user-role") ??
    readCookie(cookieStore, "x-user-role") ??
    "requester") as UserRole;
  const wallet =
    readHeader(headerStore, "x-user-wallet") ??
    readCookie(cookieStore, "x-user-wallet") ??
    FALLBACK_USERS[role].walletAddress;
  const displayName =
    readHeader(headerStore, "x-user-name") ??
    readCookie(cookieStore, "x-user-name") ??
=======
export const getCurrentUser = (): PlatformUser => {
  const headerStore = headers();
  const cookieStore = cookies();

  const id =
    headerStore.get("x-user-id") ??
    cookieStore.get("x-user-id")?.value ??
    FALLBACK_USERS.requester.id;
  const role = (headerStore.get("x-user-role") ??
    cookieStore.get("x-user-role")?.value ??
    "requester") as UserRole;
  const wallet =
    headerStore.get("x-user-wallet") ??
    cookieStore.get("x-user-wallet")?.value ??
    FALLBACK_USERS[role].walletAddress;
  const displayName =
    headerStore.get("x-user-name") ??
    cookieStore.get("x-user-name")?.value ??
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
    FALLBACK_USERS[role].displayName;

  return {
    id,
    role,
    walletAddress: wallet,
    displayName,
  };
};

