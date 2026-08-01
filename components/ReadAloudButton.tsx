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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => stopReading();
  }, []);

  return (
    <div className="space-y-2">
      <PlasticButton
        fullWidth
        variant="secondary"
        onClick={() => {
          setError(null);
          if (speaking || isReading()) {
            stopReading();
            setSpeaking(false);
            return;
          }
          const ok = readEntryAloud(entry, () => setSpeaking(false));
          setSpeaking(ok);
          if (!ok) {
            setError("Read aloud is unavailable in this browser.");
          }
        }}
      >
        {speaking ? "Stop reading" : "Read aloud"}
      </PlasticButton>
      {error ? (
        <p className="text-xs text-[color:var(--warning)]">{error}</p>
      ) : null}
    </div>
  );
}
