"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { pressFeedback } from "@/lib/feedback";
import { loadState } from "@/lib/storage";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "warning";
  fullWidth?: boolean;
};

export const PlasticButton = forwardRef<HTMLButtonElement, Props>(
  function PlasticButton(
    {
      children,
      className = "",
      variant = "primary",
      fullWidth = false,
      onClick,
      type = "button",
      ...rest
    },
    ref,
  ) {
  const variantClass =
    variant === "secondary"
      ? "plastic-button-secondary"
      : variant === "warning"
        ? "plastic-button bg-[color:var(--warning)] border-[#6f2525]"
        : "plastic-button";

  return (
    <button
      ref={ref}
      type={type}
      className={[
        variantClass,
        "inline-flex min-h-12 items-center justify-center px-4 py-3 text-center text-sm uppercase tracking-[0.08em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]",
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
  },
);
