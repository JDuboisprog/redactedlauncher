"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-[var(--color-navy-900)] ring-offset-gray-50 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-navy-300)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50",
        className
      )}
      {...rest}
    />
  )
);

Textarea.displayName = "Textarea";

