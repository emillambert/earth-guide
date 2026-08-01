"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { PlasticButton } from "@/components/PlasticButton";
import { markGuideOpened, setSkipCover } from "@/lib/storage";
import { useAppState } from "@/lib/useAppState";

export default function CoverPage() {
  const router = useRouter();
  const state = useAppState();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (state.skipCover && state.hasOpenedGuide) {
      router.replace("/index");
    }
  }, [router, state.hasOpenedGuide, state.skipCover]);

  function openGuide() {
    if (exiting) return;
    setExiting(true);
    markGuideOpened();
    window.setTimeout(() => {
      router.push("/index");
    }, 400);
  }

  return (
    <GuideShell edition="Field Cover">
      <button
        type="button"
        onClick={openGuide}
        className={[
          "relative flex min-h-[70dvh] flex-1 flex-col items-center justify-center px-4 text-center",
          exiting ? "cover-exit" : "terminal-enter",
        ].join(" ")}
        aria-label="Tap to open the Guide"
      >
        <div className="absolute inset-3 border border-[color:var(--screen-muted)]/35" />
        <div className="absolute inset-5 border border-[color:var(--screen-muted)]/20" />

        <p className="mb-6 text-[10px] uppercase tracking-[0.28em] text-[color:var(--screen-muted)]">
          Portable Earth Reference
        </p>
        <h1 className="text-4xl font-bold tracking-[0.12em] text-[color:var(--screen-text)] sm:text-5xl">
          DON&apos;T PANIC
        </h1>
        <p className="mt-8 text-sm uppercase tracking-[0.16em] text-[color:var(--screen-muted)]">
          Tap to open the Guide
        </p>
        <div className="mt-10 h-2 w-24 bg-[color:var(--highlight)]" />
      </button>

      {state.hasOpenedGuide ? (
        <div className="space-y-3 border-t border-[color:var(--screen-muted)]/25 px-4 py-4">
          <label className="flex items-start gap-3 text-left text-xs uppercase tracking-[0.12em] text-[color:var(--screen-muted)]">
            <input
              type="checkbox"
              checked={state.skipCover}
              onChange={(event) => {
                setSkipCover(event.target.checked);
              }}
              className="mt-0.5 h-4 w-4 accent-[color:var(--highlight)]"
            />
            <span>Skip cover on future launches</span>
          </label>
          <PlasticButton fullWidth variant="secondary" onClick={openGuide}>
            Open index
          </PlasticButton>
        </div>
      ) : null}
    </GuideShell>
  );
}
