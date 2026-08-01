import type { GuideEntry, GuideSupplement } from "@/types/guide";

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
