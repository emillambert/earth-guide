"use client";

import { useEffect, useState } from "react";
import { LOADING_LINES } from "@/lib/prompts";

type Props = {
  label?: string;
};

export function LoadingDisplay({ label }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % LOADING_LINES.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex flex-1 flex-col justify-center gap-4 py-10"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--screen-muted)]">
        {label ?? "Working"}
      </p>
      <p className="loading-pulse text-base uppercase tracking-[0.08em] text-[color:var(--screen-text)]">
        {LOADING_LINES[index]}
      </p>
      <div className="h-1 w-full overflow-hidden bg-[color:var(--screen-deep)]">
        <div className="h-full w-1/3 animate-pulse bg-[color:var(--highlight)]" />
      </div>
    </div>
  );
}
