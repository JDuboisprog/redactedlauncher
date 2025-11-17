"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useState } from "react";
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

<<<<<<< HEAD
declare global {
  interface Window {
    solana?: {
      connect: (args?: { onlyIfTrusted?: boolean }) => Promise<{
        publicKey: { toString(): string };
      }>;
      isPhantom?: boolean;
      publicKey?: { toString(): string };
    };
  }
}

const roles = [
  { value: "requester", label: "Requester" },
  { value: "worker", label: "Worker" },
=======
const roles = [
  { value: "requester", label: "Requester" },
  { value: "worker", label: "Worker" },
  { value: "admin", label: "Admin" },
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
] as const;

export function WalletLogin() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<typeof roles[number]["value"]>("requester");
<<<<<<< HEAD
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providerFound, setProviderFound] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const provider = window.solana;
    setProviderFound(!!provider);
    if (provider?.publicKey) {
      setWalletAddress(provider.publicKey.toString());
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined") return;
    const provider = window.solana;
    if (!provider) {
      setProviderFound(false);
      toast.error("No Solana wallet detected. Install Phantom to continue.");
      return;
    }
    setIsConnecting(true);
    try {
      const response = await provider.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);
      toast.success("Wallet connected.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wallet connection failed.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!walletAddress) {
      toast.error("Connect your wallet first.");
      return;
    }
    if (!displayName) {
      toast.error("Add a display name.");
=======
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!walletAddress || !displayName) {
      toast.error("Enter a wallet address and display name.");
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, displayName, role }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to sign you in.");
      }
      toast.success("Wallet linked. Redirecting...");
      const destination =
        role === "requester"
          ? "/requester"
          : role === "worker"
          ? "/worker"
          : "/admin/disputes";
      router.push(destination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
<<<<<<< HEAD
        <div className="space-y-3">
          <Button
            type="button"
            onClick={connectWallet}
            isLoading={isConnecting}
            className="w-full"
          >
            {walletAddress ? "Wallet connected" : "Connect Phantom wallet"}
          </Button>
          {!providerFound && (
            <p className="text-xs text-rose-500">
              Install{" "}
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Phantom
              </a>{" "}
              to sign in.
            </p>
          )}
        </div>

        {walletAddress && (
          <p className="rounded-2xl bg-gray-50 px-4 py-2 text-sm text-gray-600">
            Wallet connected via Phantom
          </p>
        )}
=======
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-navy-900)]">
            Wallet address
          </label>
          <Input
            placeholder="Enter your Solana wallet"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="font-mono"
          />
        </div>
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-navy-900)]">
            Display name
          </label>
          <Input
            placeholder="How should we refer to you?"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--color-navy-900)]">
            Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setRole(option.value)}
                className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                  role === option.value
                    ? "border-[var(--color-navy-500)] bg-[var(--color-navy-50)] text-[var(--color-navy-900)]"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!walletAddress}
        >
          Next
=======
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Continue with wallet
>>>>>>> a9a7233 (Add initial project setup with environment configuration, dependencies, and basic structure for the Orion Labeling Platform)
        </Button>
      </form>
    </Card>
  );
}

