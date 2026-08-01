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
  const [activity, setActivity] = useState<"related" | "follow-up" | null>(
    null,
  );
  const [relatedError, setRelatedError] = useState<string | null>(null);
  const entry = override && override.id === id ? override : stored ?? null;

  async function consultRelated(topic: string) {
    setRelatedError(null);
    setActivity("related");
    try {
      const next = await fetchEntry(topic);
      cacheEntry(next);
      router.push(`/entry/${next.id}`);
    } catch (error) {
      setRelatedError(
        error instanceof Error
          ? error.message
          : "The related entry could not be consulted.",
      );
      setActivity(null);
    }
  }

  async function handleFollowUp(question: string) {
    if (!entry) return;
    setActivity("follow-up");
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
      setActivity(null);
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

  if (activity === "related") {
    return <LoadingDisplay label="Consulting related entry" />;
  }

  return (
    <>
      {relatedError ? (
        <p className="mb-4 border border-[color:var(--warning)]/50 px-3 py-2 text-sm text-[color:var(--warning)]">
          {relatedError}
        </p>
      ) : null}
      <GuideEntryView
        entry={entry}
        busy={activity === "follow-up"}
        onRelated={(topic) => void consultRelated(topic)}
        onFollowUp={handleFollowUp}
      />
    </>
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
