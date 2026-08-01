"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { GuideEntryView } from "@/components/GuideEntryView";
import { PlasticButton } from "@/components/PlasticButton";
import { LoadingDisplay } from "@/components/LoadingDisplay";
import { fetchEntry, fetchFollowUp } from "@/lib/apiClient";
import { cacheEntry } from "@/lib/storage";
import { useEntry } from "@/lib/useAppState";
import { useIsClient } from "@/lib/useIsClient";
import type { GuideEntry } from "@/types/guide";

function EntryContent({ id }: { id: string }) {
  const router = useRouter();
  const isClient = useIsClient();
  const stored = useEntry(id);
  const [override, setOverride] = useState<GuideEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const entry = override && override.id === id ? override : stored ?? null;

  async function consultRelated(topic: string) {
    setBusy(true);
    try {
      const next = await fetchEntry(topic);
      cacheEntry(next);
      router.push(`/entry/${next.id}`);
    } catch {
      setBusy(false);
    }
  }

  async function handleFollowUp(question: string) {
    if (!entry) return;
    setBusy(true);
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
      setBusy(false);
    }
  }

  if (!isClient) {
    return <LoadingDisplay label="Recalling entry" />;
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
      busy={busy}
      onRelated={(topic) => void consultRelated(topic)}
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
