import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orion Labeling",
  description:
    "Solana-backed escrow platform for mobile-first CSV data labeling requests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[var(--color-gray-10)] text-[var(--color-foreground)] antialiased`}
      >
        <AppProviders>
          <div className="min-h-screen">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
