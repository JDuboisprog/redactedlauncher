import { describe, expect, it } from "vitest";

import { formatLamports, lamportsToSol, solToLamports } from "../lib/utils";

describe("Solana lamports utilities", () => {
  it("converts SOL to lamports and back without loss", () => {
    const lamports = solToLamports(0.25);
    expect(lamports).toBe(250_000_000);
    expect(lamportsToSol(lamports)).toBe(0.25);
  });

  it("formats lamports with the ◎ glyph", () => {
    const text = formatLamports(1_500_000_000, 2);
    expect(text).toContain("◎");
    expect(text).toMatch(/1[.,]5/);
  });
});

