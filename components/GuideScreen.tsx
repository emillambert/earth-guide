"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  resetKey?: string;
};

export function GuideScreen({ children, className = "", resetKey }: Props) {
  const screenRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (resetKey === undefined) return;
    const screen = screenRef.current;
    screen?.scrollTo({ top: 0 });
    const frame = window.requestAnimationFrame(() => {
      screen
        ?.querySelector<HTMLElement>("[data-page-heading]")
        ?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [resetKey]);

  return (
    <main
      ref={screenRef}
      id="main-content"
      tabIndex={-1}
      className={[
        "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-4 sm:px-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </main>
  );
}
