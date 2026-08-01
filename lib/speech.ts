import type { GuideEntry } from "@/types/guide";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function buildEntrySpeechText(entry: GuideEntry): string {
  const parts = [
    entry.title,
    entry.verdict,
    ...entry.body,
  ];

  if (entry.travellerNote) {
    parts.push("Traveller's note.", entry.travellerNote);
  }
  if (entry.caution) {
    parts.push("Caution.", entry.caution);
  }
  if (entry.supplements?.length) {
    for (const supplement of entry.supplements) {
      parts.push(supplement.heading, ...supplement.body);
    }
  }

  return parts.filter(Boolean).join(" ");
}

export function stopReading(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function readEntryAloud(
  entry: GuideEntry,
  onEnd?: () => void,
): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return false;
  }

  stopReading();
  const utterance = new SpeechSynthesisUtterance(buildEntrySpeechText(entry));
  utterance.rate = 0.95;
  utterance.pitch = 0.95;
  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    onEnd?.();
  };
  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function isReading(): boolean {
  return Boolean(currentUtterance);
}
