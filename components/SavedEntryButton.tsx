"use client";

import { PlasticButton } from "@/components/PlasticButton";
import { removeSavedEntry, saveEntry } from "@/lib/storage";
import { useAppState } from "@/lib/useAppState";
import type { GuideEntry } from "@/types/guide";

type Props = {
  entry: GuideEntry;
};

export function SavedEntryButton({ entry }: Props) {
  const state = useAppState();
  const saved = state.savedEntries.some((item) => item.id === entry.id);

  return (
    <PlasticButton
      fullWidth
      variant={saved ? "secondary" : "primary"}
      onClick={() => {
        if (saved) {
          removeSavedEntry(entry.id);
        } else {
          saveEntry(entry);
        }
      }}
    >
      {saved ? "Remove saved entry" : "Save entry"}
    </PlasticButton>
  );
}
