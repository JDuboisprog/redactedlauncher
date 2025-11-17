import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const LAMPORTS_PER_SOL = 1_000_000_000;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const lamportsToSol = (lamports: number) =>
  lamports / LAMPORTS_PER_SOL;

export const solToLamports = (sol: number) =>
  Math.round(sol * LAMPORTS_PER_SOL);

export const formatLamports = (lamports: number, minimumFractionDigits = 4) =>
  `${lamportsToSol(lamports).toLocaleString(undefined, {
    minimumFractionDigits,
    maximumFractionDigits: 9,
  })} ◎`;

export const formatCurrency = (value: number, currency = "USD") =>
  value.toLocaleString(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });

export const nowIso = () => new Date().toISOString();

