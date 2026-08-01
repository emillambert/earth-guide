"use client";

import type { ReactNode } from "react";

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
        <div className="relative z-10 flex min-h-14 items-center justify-between px-5 pb-2 pt-3 text-[10px] uppercase tracking-[0.18em] text-[#9a9b8f]">
          <span className="max-w-[68%] leading-relaxed">
            The Hitchhiker&apos;s Guide
            <span className="block text-[8px] tracking-[0.18em] text-[#7d806f]">
              to the Galaxy
            </span>
          </span>
          <span className="max-w-[30%] text-right text-[9px] leading-relaxed text-[#7d806f]">
            {edition}
          </span>
        </div>

        <div className="relative z-10 mx-3 mb-3 flex flex-1 flex-col overflow-hidden rounded-[0.85rem] border border-[#1a1b18] bg-[#151613] p-2 shadow-[var(--inset-shadow)] sm:mx-4 sm:mb-4">
          <div className="guide-screen relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[0.55rem]">
            <div className="guide-scanlines absolute inset-0 z-10" />
            <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </div>
        </div>

        {footer ? (
          <div className="relative z-10 px-5 pb-4 text-[10px] uppercase tracking-[0.18em] text-[#7f8274]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
