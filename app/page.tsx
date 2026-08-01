"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/useAppState";
import { useIsClient } from "@/lib/useIsClient";

export default function HomePage() {
  const router = useRouter();
  const isClient = useIsClient();
  const state = useAppState();

  useEffect(() => {
    if (!isClient) return;
    if (state.skipCover && state.hasOpenedGuide) {
      router.replace("/index");
    } else {
      router.replace("/cover");
    }
  }, [isClient, router, state.hasOpenedGuide, state.skipCover]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#121311] text-[#9a9b8f]">
      <p className="text-xs uppercase tracking-[0.2em]">Opening…</p>
    </div>
  );
}
