"use client";

import { useEffect, useState } from "react";
import { IndeterminateBar } from "@/components/IndeterminateBar";
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
      aria-busy="true"
      aria-label={`${label ?? "Working"}. Please wait.`}
      className="flex flex-1 flex-col justify-center gap-4 py-10"
    >
      <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--screen-muted)]">
        {label ?? "Working"}
      </p>
      <p
        aria-hidden="true"
        className="loading-pulse text-base uppercase tracking-[0.08em] text-[color:var(--screen-text)]"
      >
        {LOADING_LINES[index]}
      </p>
      <IndeterminateBar />
    </div>
  );
}
