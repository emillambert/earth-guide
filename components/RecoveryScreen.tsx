"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";

type Props = {
  label: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

const linkClass =
  "plastic-button inline-flex min-h-12 w-full items-center justify-center px-4 py-3 text-center text-sm uppercase tracking-[0.08em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]";

export function RecoveryScreen({ label, title, children, action }: Props) {
  return (
    <GuideShell>
      <GuideScreen>
        <div className="terminal-enter flex flex-1 flex-col justify-center gap-5 py-8">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--screen-muted)]">
              {label}
            </p>
            <h1
              data-page-heading
              tabIndex={-1}
              className="text-2xl font-semibold uppercase leading-tight tracking-[0.05em]"
            >
              {title}
            </h1>
          </header>
          <div className="text-sm leading-relaxed text-[color:var(--screen-muted)]">
            {children}
          </div>
          {action}
          <div className="grid gap-2">
            <Link href="/guide" className={linkClass}>
              Return to index
            </Link>
            <Link
              href="/saved"
              className={`${linkClass} plastic-button-secondary`}
            >
              Open saved entries
            </Link>
          </div>
        </div>
      </GuideScreen>
    </GuideShell>
  );
}
