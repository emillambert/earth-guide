"use client";

import { useEffect, useState } from "react";
import { IndeterminateBar } from "@/components/IndeterminateBar";
import { LOADING_LINES } from "@/lib/prompts";
import type { PendingEntry } from "@/lib/pendingEntries";

export function ProgressiveGuideEntry({ pending }: { pending: PendingEntry }) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStatusIndex((index) => (index + 1) % LOADING_LINES.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  const { progress } = pending;

  return (
    <article className="space-y-6 pb-6" aria-busy="true">
      <p role="status" className="sr-only">
        Guide entry is arriving live.
      </p>
      <header className="space-y-2 border-b border-[color:var(--screen-muted)]/30 pb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--screen-muted)]">
            Guide entry
          </p>
          <p className="loading-pulse text-[10px] uppercase tracking-[0.16em] text-[color:var(--highlight)]">
            Arriving live
          </p>
        </div>
        <h1
          key={progress.title ?? pending.query}
          data-page-heading
          tabIndex={-1}
          className="terminal-enter text-2xl font-semibold uppercase leading-tight tracking-[0.04em]"
        >
          {progress.title ?? pending.query}
        </h1>
        {progress.opening ? (
          <p className="terminal-enter text-base leading-relaxed text-[color:var(--screen-text)]">
            {progress.opening}
          </p>
        ) : (
          <div className="space-y-2 py-1" aria-hidden="true">
            <div className="h-3 w-full animate-pulse bg-[color:var(--screen-deep)]" />
            <div className="h-3 w-4/5 animate-pulse bg-[color:var(--screen-deep)]" />
          </div>
        )}
      </header>

      {progress.paragraphs.length ? (
        <div className="space-y-3 text-[15px] leading-relaxed">
          {progress.paragraphs.map((paragraph, index) => (
            <p
              key={`${index}-${paragraph.slice(0, 24)}`}
              className="terminal-enter"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-3 w-full animate-pulse bg-[color:var(--screen-deep)]" />
          <div className="h-3 w-11/12 animate-pulse bg-[color:var(--screen-deep)]" />
          <div className="h-3 w-3/4 animate-pulse bg-[color:var(--screen-deep)]" />
        </div>
      )}

      <div className="space-y-3 border-t border-[color:var(--screen-muted)]/25 pt-4">
        <p
          aria-hidden="true"
          className="loading-pulse text-xs uppercase tracking-[0.14em] text-[color:var(--screen-muted)]"
        >
          {LOADING_LINES[statusIndex]}
        </p>
        <IndeterminateBar />
        <p className="text-[10px] leading-relaxed text-[color:var(--screen-muted)]">
          Completed sections appear as the editorial transmission arrives.
        </p>
      </div>
    </article>
  );
}
