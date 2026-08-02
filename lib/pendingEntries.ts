"use client";

import { useSyncExternalStore } from "react";
import { streamEntry } from "@/lib/apiClient";
import { requestCoordinates, reverseGeocode } from "@/lib/location";
import { cacheEntry } from "@/lib/storage";
import type { GuideProgress } from "@/lib/progressiveJson";

type EntryRequest =
  | {
      query?: string;
      surprise?: boolean;
      kind: "lookup" | "surprise";
    }
  | {
      kind: "local";
    };

export type PendingEntry = {
  id: string;
  query: string;
  request: EntryRequest;
  progress: GuideProgress;
  status: "generating" | "error";
  error?: string;
};

const listeners = new Set<() => void>();
let entries: Record<string, PendingEntry> = {};

function notify() {
  listeners.forEach((listener) => listener());
}

function setPending(id: string, entry: PendingEntry | undefined) {
  if (entry) {
    entries = { ...entries, [id]: entry };
  } else {
    const next = { ...entries };
    delete next[id];
    entries = next;
  }
  notify();
}

function updatePending(
  id: string,
  updater: (entry: PendingEntry) => PendingEntry,
) {
  const current = entries[id];
  if (!current) return;
  const next = updater(current);
  if (next === current) return;
  setPending(id, next);
}

function sameProgress(left: GuideProgress, right: GuideProgress): boolean {
  return (
    left.title === right.title &&
    left.opening === right.opening &&
    left.paragraphs.length === right.paragraphs.length &&
    left.paragraphs.every((paragraph, index) => paragraph === right.paragraphs[index])
  );
}

async function runGeneration(id: string) {
  const pending = entries[id];
  if (!pending) return;

  try {
    let streamInput:
      | { entryId: string; query?: string; surprise?: boolean }
      | {
          entryId: string;
          local: {
            latitude: number;
            longitude: number;
            placeName: string;
          };
        };

    if (pending.request.kind === "local") {
      const coordinates = await requestCoordinates();
      const placeName = await reverseGeocode(
        coordinates.latitude,
        coordinates.longitude,
      );
      updatePending(id, (current) => ({ ...current, query: placeName }));
      streamInput = {
        entryId: id,
        local: { ...coordinates, placeName },
      };
    } else {
      streamInput = {
        entryId: id,
        query: pending.request.query,
        surprise: pending.request.surprise,
      };
    }

    const entry = await streamEntry(
      streamInput,
      {
        onStarted(query) {
          updatePending(id, (current) =>
            current.query === query ? current : { ...current, query },
          );
        },
        onProgress(progress) {
          updatePending(id, (current) =>
            sameProgress(current.progress, progress)
              ? current
              : { ...current, progress },
          );
        },
      },
    );
    cacheEntry(entry);
    setPending(id, undefined);
  } catch (error) {
    updatePending(id, (current) => ({
      ...current,
      status: "error",
      error:
        error instanceof Error
          ? error.message
          : "The Guide could not complete this entry.",
    }));
  }
}

export function beginEntryGeneration(request: {
  query?: string;
  surprise?: boolean;
  local?: boolean;
}): string {
  const id = crypto.randomUUID();
  const kind = request.local
    ? "local"
    : request.surprise
      ? "surprise"
      : "lookup";
  setPending(id, {
    id,
    query:
      request.query?.trim() ||
      (request.local
        ? "Finding your location"
        : request.surprise
          ? "Surprise entry"
          : "Guide entry"),
    request: request.local ? { kind: "local" } : { ...request, kind },
    progress: { paragraphs: [] },
    status: "generating",
  });
  void runGeneration(id);
  return id;
}

export function retryEntryGeneration(id: string): void {
  updatePending(id, (current) => ({
    ...current,
    progress: { paragraphs: [] },
    status: "generating",
    error: undefined,
  }));
  void runGeneration(id);
}

export function subscribePending(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPendingEntry(id: string): PendingEntry | undefined {
  return entries[id];
}

export function usePendingEntry(id: string): PendingEntry | undefined {
  return useSyncExternalStore(
    subscribePending,
    () => getPendingEntry(id),
    () => undefined,
  );
}
