"use client";

import { PropsWithChildren, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@aws-amplify/ui-react";

import { ensureAmplifyConfigured } from "@/lib/amplifyClient";

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    ensureAmplifyConfigured();
  }, []);

  return (
    <ThemeProvider colorMode="system">
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--color-navy-900)",
            color: "var(--color-gray-10)",
          },
        }}
      />
    </ThemeProvider>
  );
}

