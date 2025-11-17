import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends PropsWithChildren {
  className?: string;
  variant?: "surface" | "elevated";
}

export const Card = ({ children, className, variant = "surface" }: CardProps) => (
  <div
    className={cn(
      "rounded-3xl border border-gray-100 bg-white p-5 shadow-sm",
      variant === "elevated" &&
        "border-transparent shadow-[0_25px_45px_rgba(7,18,43,0.07)]",
      className
    )}
  >
    {children}
  </div>
);

