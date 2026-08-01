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
  edition = "Edition 42.1",
}: Props) {
  return (
    <div className="min-h-dvh bg-[#121311] px-3 py-3 sm:px-4 sm:py-5">
      <div className="guide-shell relative mx-auto flex min-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-[1.6rem] border border-[#3a3c38] sm:min-h-[calc(100dvh-2.5rem)]">
        <div className="relative z-10 flex items-center justify-between px-5 pb-2 pt-4 text-[10px] uppercase tracking-[0.22em] text-[#9a9b8f]">
          <span>Earth Guide</span>
          <span className="text-[#7d806f]">{edition}</span>
        </div>

        <div className="relative z-10 mx-3 mb-3 flex-1 overflow-hidden rounded-[0.85rem] border border-[#1a1b18] bg-[#151613] p-2 shadow-[var(--inset-shadow)] sm:mx-4 sm:mb-4">
          <div className="guide-screen relative flex h-full min-h-[70dvh] flex-col overflow-hidden rounded-[0.55rem]">
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
        ) : (
          <div className="relative z-10 px-5 pb-4 text-[10px] uppercase tracking-[0.18em] text-[#7f8274]">
            Portable reference terminal
          </div>
        )}
      </div>
    </div>
  );
}
