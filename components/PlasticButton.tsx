"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { pressFeedback } from "@/lib/feedback";
import { loadState } from "@/lib/storage";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "warning";
  fullWidth?: boolean;
};

export function PlasticButton({
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
  onClick,
  type = "button",
  ...rest
}: Props) {
  const variantClass =
    variant === "secondary"
      ? "plastic-button-secondary"
      : variant === "warning"
        ? "plastic-button bg-[color:var(--warning)] border-[#6f2525]"
        : "plastic-button";

  return (
    <button
      type={type}
      className={[
        variantClass,
        "min-h-12 px-4 py-3 text-left text-sm uppercase tracking-[0.08em]",
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={(event) => {
        const { soundEnabled } = loadState();
        pressFeedback(soundEnabled);
        onClick?.(event);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
