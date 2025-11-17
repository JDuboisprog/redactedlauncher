"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-[var(--color-navy-900)] ring-offset-gray-50 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy-300)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50",
        className
      )}
      {...rest}
    />
  )
);

Input.displayName = "Input";

