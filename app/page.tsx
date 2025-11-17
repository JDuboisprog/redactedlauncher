import { WalletLogin } from "@/components/auth/wallet-login";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-5 py-12 sm:px-8">
      <div className="space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-500">
          Orion Labeling
        </p>
        <h1 className="text-4xl font-semibold text-[var(--color-navy-900)]">
          Sign in with your Solana wallet
        </h1>
        <p className="text-sm text-gray-600">
          Choose your role and link the custodial wallet you&apos;ll use for
          escrow, payouts, or dispute review.
        </p>
      </div>

      <WalletLogin />

      <p className="text-center text-xs text-gray-500">
        We only store your wallet address + role in secure cookies. Switch roles
        anytime by signing in again.
      </p>
    </div>
  );
}
