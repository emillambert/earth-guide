"use client";

import { useSyncExternalStore } from "react";
import {
  getServerSnapshot,
  loadState,
  subscribeToStorage,
} from "@/lib/storage";
import type { AppState, GuideEntry } from "@/types/guide";

export function useAppState(): AppState {
  return useSyncExternalStore(subscribeToStorage, loadState, getServerSnapshot);
}

export function useEntry(id: string | undefined): GuideEntry | undefined {
  const state = useAppState();
  if (!id) return undefined;
  return (
    state.entryCache[id] ??
    state.recentEntries.find((entry) => entry.id === id) ??
    state.savedEntries.find((entry) => entry.id === id)
  );
}
