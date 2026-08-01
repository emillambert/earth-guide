import type { GuideEntry, GuideSupplement } from "@/types/guide";
import {
  extractGuideProgress,
  type GuideProgress,
} from "@/lib/progressiveJson";

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
}

export async function fetchEntry(query: string): Promise<GuideEntry> {
  const response = await fetch("/api/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = (await response.json()) as { entry: GuideEntry };
  return data.entry;
}

type StreamEntryInput = {
  entryId: string;
  query?: string;
  surprise?: boolean;
};

type StreamCallbacks = {
  onStarted?: (query: string) => void;
  onProgress: (progress: GuideProgress) => void;
};

export async function streamEntry(
  input: StreamEntryInput,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<GuideEntry> {
  const response = await fetch("/api/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, stream: true }),
    signal,
  });
  if (!response.ok) throw new Error(await parseError(response));
  if (!response.body) throw new Error("The Guide stream is unavailable.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let lineBuffer = "";
  let jsonBuffer = "";
  let completed: GuideEntry | null = null;

  const processLine = (line: string) => {
    if (!line.trim()) return;
    const event = JSON.parse(line) as
      | { type: "started"; query: string }
      | { type: "delta"; delta: string }
      | { type: "complete"; entry: GuideEntry }
      | { type: "error"; error: string };

    if (event.type === "started") {
      callbacks.onStarted?.(event.query);
    } else if (event.type === "delta") {
      jsonBuffer += event.delta;
      callbacks.onProgress(extractGuideProgress(jsonBuffer));
    } else if (event.type === "complete") {
      completed = event.entry;
    } else if (event.type === "error") {
      throw new Error(event.error);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    lineBuffer += decoder.decode(value, { stream: !done });

    let newline = lineBuffer.indexOf("\n");
    while (newline !== -1) {
      processLine(lineBuffer.slice(0, newline));
      lineBuffer = lineBuffer.slice(newline + 1);
      newline = lineBuffer.indexOf("\n");
    }

    if (done) break;
  }

  if (lineBuffer.trim()) processLine(lineBuffer);
  if (!completed) throw new Error("The Guide stream ended unexpectedly.");
  return completed;
}

export async function fetchSurpriseEntry(): Promise<GuideEntry> {
  const response = await fetch("/api/entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ surprise: true }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = (await response.json()) as { entry: GuideEntry };
  return data.entry;
}

export async function fetchLocalEntry(input: {
  latitude: number;
  longitude: number;
  placeName: string;
}): Promise<GuideEntry> {
  const response = await fetch("/api/local-entry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = (await response.json()) as { entry: GuideEntry };
  return data.entry;
}

export async function fetchIdentifyEntry(input: {
  imageDataUrl: string;
  question?: string;
}): Promise<GuideEntry> {
  const response = await fetch("/api/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = (await response.json()) as { entry: GuideEntry };
  return data.entry;
}

export async function fetchFollowUp(
  entry: GuideEntry,
  question: string,
): Promise<GuideSupplement> {
  const response = await fetch("/api/follow-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entry, question }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = (await response.json()) as { supplement: GuideSupplement };
  return data.supplement;
}
