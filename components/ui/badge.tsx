import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface BadgeProps extends PropsWithChildren {
  tone?: "info" | "success" | "warning" | "danger" | "neutral";
  className?: string;
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  info: "bg-[var(--color-navy-50)] text-[var(--color-navy-500)]",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  neutral: "bg-gray-100 text-gray-600",
};

export const Badge = ({ tone = "neutral", children, className }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      toneClasses[tone],
      className
    )}
  >
    {children}
  </span>
);

