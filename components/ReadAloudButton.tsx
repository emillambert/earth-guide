"use client";

import { useEffect, useState } from "react";
import { PlasticButton } from "@/components/PlasticButton";
import { isReading, readEntryAloud, stopReading } from "@/lib/speech";
import type { GuideEntry } from "@/types/guide";

type Props = {
  entry: GuideEntry;
};

export function ReadAloudButton({ entry }: Props) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => stopReading();
  }, []);

  return (
    <PlasticButton
      fullWidth
      variant="secondary"
      onClick={() => {
        if (speaking || isReading()) {
          stopReading();
          setSpeaking(false);
          return;
        }
        const ok = readEntryAloud(entry, () => setSpeaking(false));
        setSpeaking(ok);
      }}
    >
      {speaking ? "Stop reading" : "Read aloud"}
    </PlasticButton>
  );
}
