"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { GuideEntryView } from "@/components/GuideEntryView";
import { ProgressiveGuideEntry } from "@/components/ProgressiveGuideEntry";
import { PlasticButton } from "@/components/PlasticButton";
import { LoadingDisplay } from "@/components/LoadingDisplay";
import { Notice } from "@/components/Notice";
import { PageNav } from "@/components/PageNav";
import { fetchFollowUp } from "@/lib/apiClient";
import {
  beginEntryGeneration,
  retryEntryGeneration,
  usePendingEntry,
} from "@/lib/pendingEntries";
import { cacheEntry } from "@/lib/storage";
import { useEntry } from "@/lib/useAppState";
import { useIsClient } from "@/lib/useIsClient";
import type { GuideEntry } from "@/types/guide";

function EntryContent({ id }: { id: string }) {
  const router = useRouter();
  const isClient = useIsClient();
  const stored = useEntry(id);
  const pending = usePendingEntry(id);
  const [override, setOverride] = useState<GuideEntry | null>(null);
  const [followUpBusy, setFollowUpBusy] = useState(false);
  const entry = override && override.id === id ? override : stored ?? null;

  function consultRelated(topic: string) {
    const nextId = beginEntryGeneration({ query: topic });
    router.push(`/entry/${nextId}`);
  }

  async function handleFollowUp(question: string) {
    if (!entry) return;
    setFollowUpBusy(true);
    try {
      const supplement = await fetchFollowUp(entry, question);
      const updated: GuideEntry = {
        ...entry,
        supplements: [...(entry.supplements ?? []), supplement],
        relatedEntries: Array.from(
          new Set([
            ...entry.relatedEntries,
            ...(supplement.relatedEntries ?? []),
          ]),
        ),
      };
      cacheEntry(updated);
      setOverride(updated);
    } finally {
      setFollowUpBusy(false);
    }
  }

  if (!isClient) {
    return <LoadingDisplay label="Recalling entry" />;
  }

  if (!entry && pending?.status === "generating") {
    return <ProgressiveGuideEntry pending={pending} />;
  }

  if (!entry && pending?.status === "error") {
    return (
      <div className="terminal-enter space-y-5 py-8">
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
            Transmission interrupted
          </p>
          <h1 className="text-xl font-semibold uppercase tracking-[0.04em]">
            {pending.progress.title ?? pending.query}
          </h1>
          <Notice>{pending.error}</Notice>
        </div>
        <PlasticButton fullWidth onClick={() => retryEntryGeneration(id)}>
          Retry transmission
        </PlasticButton>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="py-8">
        <Notice tone="muted" role="status">
          This entry is no longer held in local memory.
        </Notice>
      </div>
    );
  }

  return (
    <GuideEntryView
      entry={entry}
      busy={followUpBusy}
      onRelated={consultRelated}
      onFollowUp={handleFollowUp}
    />
  );
}

export default function EntryPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return (
    <GuideShell>
      <GuideScreen>
        <PageNav saved />

        {id ? <EntryContent key={id} id={id} /> : null}
      </GuideScreen>
    </GuideShell>
  );
}
