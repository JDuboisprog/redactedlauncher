"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-navy-500)] text-white shadow-[0_20px_35px_rgba(7,18,43,0.3)] hover:bg-[var(--color-navy-400)] disabled:bg-[var(--color-navy-700)]",
  secondary:
    "bg-[var(--color-gray-50)] text-[var(--color-navy-900)] hover:bg-white disabled:bg-white disabled:text-gray-400",
  outline:
    "border border-[var(--color-navy-400)] text-[var(--color-navy-500)] hover:bg-[var(--color-navy-50)] disabled:border-gray-200 disabled:text-gray-400",
  ghost:
    "text-[var(--color-navy-500)] hover:bg-[var(--color-gray-50)] disabled:text-gray-400",
  danger:
    "bg-rose-500 text-white hover:bg-rose-400 focus-visible:ring-rose-500/40",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", children, isLoading, disabled, asChild, ...rest },
    ref
  ) => {
    const baseClassName = cn(
      "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-navy-300)] focus-visible:ring-offset-gray-50 disabled:opacity-70",
      variantClasses[variant],
      className
    );

    if (asChild) {
      return (
        <Slot className={baseClassName} {...rest}>
          {isLoading ? "Please wait…" : children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={baseClassName}
        {...rest}
      >
        {isLoading ? "Please wait…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";

