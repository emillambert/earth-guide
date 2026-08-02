"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EDITORIAL_STATUS_LINES } from "@/lib/prompts";
import { STORAGE_ERROR_EVENT } from "@/lib/storage";

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  edition?: string;
};

export function GuideShell({
  children,
  footer,
  edition = "Earth Edition 42.1",
}: Props) {
  const [storageError, setStorageError] = useState("");
  const [statusIndex, setStatusIndex] = useState(1);

  useEffect(() => {
    const handleStorageError = (event: Event) => {
      setStorageError(
        event instanceof CustomEvent && typeof event.detail === "string"
          ? event.detail
          : "Device storage is unavailable. Changes may not survive this session.",
      );
    };
    window.addEventListener(STORAGE_ERROR_EVENT, handleStorageError);
    return () =>
      window.removeEventListener(STORAGE_ERROR_EVENT, handleStorageError);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setStatusIndex(
        (current) => (current + 1) % EDITORIAL_STATUS_LINES.length,
      );
    }, 12000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-dvh bg-[#121311] px-3 sm:px-4"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
    >
      <div className="guide-shell relative mx-auto flex min-h-[calc(100dvh-1.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] w-full max-w-md flex-col overflow-hidden rounded-[1.6rem] border border-[#3a3c38] sm:min-h-[calc(100dvh-2.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))]">
        <header className="relative z-10 flex min-h-14 items-center justify-between px-5 pb-2 pt-3 text-[11px] uppercase tracking-[0.16em] text-[#b2b4a7]">
          <span className="max-w-[68%] leading-relaxed">
            The Hitchhiker&apos;s Guide
            <span className="block text-[10px] tracking-[0.16em] text-[#9fa295]">
              to the Galaxy
            </span>
          </span>
          <span className="max-w-[32%] text-right text-[10px] leading-relaxed text-[#9fa295]">
            {edition}
          </span>
        </header>

        <div className="relative z-10 mx-3 mb-3 flex flex-1 flex-col overflow-hidden rounded-[0.85rem] border border-[#1a1b18] bg-[#151613] p-2 shadow-[var(--inset-shadow)] sm:mx-4 sm:mb-4">
          <div className="guide-screen relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[0.55rem]">
            <div className="guide-scanlines absolute inset-0 z-10" />
            <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
            {storageError ? (
              <div
                role="alert"
                className="absolute inset-x-3 bottom-3 z-30 border border-[color:var(--warning)]/60 bg-[color:var(--screen)] px-3 py-3 text-sm leading-relaxed text-[color:var(--warning)] shadow-lg"
              >
                <p>{storageError}</p>
                <button
                  type="button"
                  onClick={() => setStorageError("")}
                  className="mt-2 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.12em] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]"
                >
                  Dismiss
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative z-10 px-5 pb-4 text-[10px] uppercase tracking-[0.18em] text-[#9a9b8f]">
          {footer ?? EDITORIAL_STATUS_LINES[statusIndex]}
        </div>
      </div>
    </div>
  );
}
