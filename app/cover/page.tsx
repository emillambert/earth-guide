"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { PlasticButton } from "@/components/PlasticButton";
import { markGuideOpened, setSkipCover } from "@/lib/storage";
import { useAppState } from "@/lib/useAppState";

export default function CoverPage() {
  const router = useRouter();
  const pathname = usePathname();
  const state = useAppState();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (pathname === "/" && state.skipCover && state.hasOpenedGuide) {
      router.replace("/guide");
    }
  }, [pathname, router, state.hasOpenedGuide, state.skipCover]);

  function openGuide() {
    if (exiting) return;
    setExiting(true);
    markGuideOpened();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.setTimeout(() => {
      router.push("/guide");
    }, reducedMotion ? 0 : 400);
  }

  return (
    <GuideShell>
      <GuideScreen className="!p-0">
      <div
        className={[
          "relative flex flex-1 flex-col",
          exiting ? "cover-exit" : "terminal-enter",
        ].join(" ")}
      >
        <div className="relative flex flex-1 flex-col items-center justify-center px-7 py-12 text-center">
          <div className="pointer-events-none absolute inset-3 border border-[color:var(--screen-muted)]/35" />
          <div className="pointer-events-none absolute inset-5 border border-[color:var(--screen-muted)]/20" />

          <p className="mb-6 text-[10px] uppercase tracking-[0.22em] text-[color:var(--screen-muted)]">
            Field cover
          </p>
          <h1
            data-page-heading
            tabIndex={-1}
            className="text-4xl font-bold tracking-[0.12em] text-[color:var(--screen-text)] sm:text-5xl"
          >
            DON&apos;T PANIC
          </h1>
          <div className="mb-10 mt-8 h-2 w-24 bg-[color:var(--highlight)]" />
          <PlasticButton fullWidth onClick={openGuide}>
            Open index
          </PlasticButton>
        </div>

        {state.hasOpenedGuide ? (
          <label className="flex min-h-12 items-center gap-3 border-t border-[color:var(--screen-muted)]/25 px-5 py-3 text-left text-xs uppercase tracking-[0.1em] text-[color:var(--screen-muted)]">
              <input
                type="checkbox"
                checked={state.skipCover}
                onChange={(event) => {
                  setSkipCover(event.target.checked);
                }}
                className="h-5 w-5 shrink-0 accent-[color:var(--highlight)]"
              />
              <span>Skip cover on future launches</span>
            </label>
        ) : null}
      </div>
      </GuideScreen>
    </GuideShell>
  );
}
