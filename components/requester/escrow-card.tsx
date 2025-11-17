"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { lamportsToSol, solToLamports } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EscrowFundingCardProps {
  taskId: string;
  totalEscrowLamports: number;
  paidLamports: number;
  escrowAccount?: string;
}

export function EscrowFundingCard({
  taskId,
  totalEscrowLamports,
  paidLamports,
  escrowAccount,
}: EscrowFundingCardProps) {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [isFunding, setIsFunding] = useState(false);
  const remainingLamports = Math.max(totalEscrowLamports - paidLamports, 0);
  const defaultSol = lamportsToSol(remainingLamports);
  const [amountSol, setAmountSol] = useState(defaultSol.toFixed(3));

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await fetch("/api/wallets");
        const payload = await response.json();
        setWalletAddress(payload.wallet?.address);
      } catch {
        toast.error("Unable to fetch wallet.");
      }
    };
    loadWallet();
  }, []);

  const copyToClipboard = async (value?: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  const handleFund = async () => {
    setIsFunding(true);
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fund",
          taskId,
          amountLamports: solToLamports(Number(amountSol)),
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Escrow funding failed.");
      }
      toast.success("Escrow funded.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <Card className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Custodial wallet
        </p>
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <span className="font-mono text-[var(--color-navy-900)]">
            {walletAddress ?? "Loading..."}
          </span>
          <Button
            variant="ghost"
            className="w-fit px-0 text-xs"
            onClick={() => copyToClipboard(walletAddress)}
            disabled={!walletAddress}
          >
            Copy wallet
          </Button>
        </div>
      </div>
      <div className="rounded-2xl bg-gray-50 p-3 text-xs text-gray-600">
        <p className="font-semibold text-[var(--color-navy-900)]">
          Escrow account
        </p>
        <p className="font-mono">{escrowAccount ?? "Will be generated after funding"}</p>
      </div>
      <label className="text-sm text-gray-600">
        Fund amount (◎)
        <Input
          type="number"
          min="0"
          step="0.001"
          value={amountSol}
          onChange={(e) => setAmountSol(e.target.value)}
        />
      </label>
      <Button className="w-full" onClick={handleFund} isLoading={isFunding}>
        Fund escrow
      </Button>
    </Card>
  );
}

