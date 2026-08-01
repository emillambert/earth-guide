"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { GuideEntryView } from "@/components/GuideEntryView";
import { ProgressiveGuideEntry } from "@/components/ProgressiveGuideEntry";
import { PlasticButton } from "@/components/PlasticButton";
import { LoadingDisplay } from "@/components/LoadingDisplay";
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
          <p className="border border-[color:var(--warning)]/50 px-3 py-3 text-sm text-[color:var(--warning)]">
            {pending.error}
          </p>
        </div>
        <div className="grid gap-2">
          <PlasticButton
            fullWidth
            onClick={() => retryEntryGeneration(id)}
          >
            Retry transmission
          </PlasticButton>
          <PlasticButton
            fullWidth
            variant="secondary"
            onClick={() => router.push("/guide")}
          >
            Return to index
          </PlasticButton>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-4 py-8">
        <p className="text-sm leading-relaxed">
          This entry is no longer held in local memory.
        </p>
        <PlasticButton fullWidth onClick={() => router.push("/guide")}>
          Return to index
        </PlasticButton>
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
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/guide"
            className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--screen-muted)] underline-offset-2 hover:underline"
          >
            ← Index
          </Link>
          <Link
            href="/saved"
            className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--screen-muted)] underline-offset-2 hover:underline"
          >
            Saved
          </Link>
        </div>

        {id ? <EntryContent key={id} id={id} /> : null}
      </GuideScreen>
    </GuideShell>
  );
}
