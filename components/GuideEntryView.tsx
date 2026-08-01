"use client";

import { useMemo, useState, type FormEvent } from "react";
import { RelatedEntries } from "@/components/RelatedEntries";
import { SavedEntryButton } from "@/components/SavedEntryButton";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { PlasticButton } from "@/components/PlasticButton";
import { LoadingDisplay } from "@/components/LoadingDisplay";
import type { GuideEntry } from "@/types/guide";

type Props = {
  entry: GuideEntry;
  onRelated: (topic: string) => void;
  onFollowUp: (question: string) => Promise<void>;
  busy?: boolean;
};

export function GuideEntryView({
  entry,
  onRelated,
  onFollowUp,
  busy = false,
}: Props) {
  const [question, setQuestion] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatedLabel = useMemo(() => {
    try {
      return new Date(entry.generatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return entry.generatedAt;
    }
  }, [entry.generatedAt]);

  const related = useMemo(() => {
    const fromSupplements =
      entry.supplements?.flatMap((item) => item.relatedEntries ?? []) ?? [];
    return Array.from(new Set([...entry.relatedEntries, ...fromSupplements]));
  }, [entry]);

  async function handleFollowUp(event: FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    setError(null);
    try {
      await onFollowUp(trimmed);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Follow-up failed.");
    }
  }

  if (busy && !entry.body.length) {
    return <LoadingDisplay label="Consulting index" />;
  }

  return (
    <article className="terminal-enter space-y-6 pb-6">
      <header className="space-y-2 border-b border-[color:var(--screen-muted)]/30 pb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--screen-muted)]">
          Guide entry
        </p>
        <h1 className="text-2xl font-semibold uppercase tracking-[0.04em] leading-tight">
          {entry.title}
        </h1>
        <p className="text-sm leading-relaxed text-[color:var(--screen-text)]">
          {entry.verdict}
        </p>
        {entry.kind === "identify" && typeof entry.confidence === "number" ? (
          <div className="mt-3 space-y-1 border border-[color:var(--screen-muted)]/35 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
              Probable identification
            </p>
            <p className="text-sm uppercase tracking-[0.06em]">{entry.title}</p>
            <p className="text-xs text-[color:var(--screen-muted)]">
              Guide confidence: {Math.round(entry.confidence)}%
            </p>
          </div>
        ) : null}
      </header>

      {entry.highRisk ? (
        <p className="border border-[color:var(--warning)] bg-[color:var(--warning)]/10 px-3 py-2 text-sm leading-relaxed text-[color:var(--warning)]">
          This entry is general information, not emergency or professional
          guidance.
        </p>
      ) : null}

      <div className="space-y-3 text-[15px] leading-relaxed">
        {entry.body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      {entry.travellerNote ? (
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
            Traveller&apos;s note
          </h2>
          <p className="text-[15px] leading-relaxed">{entry.travellerNote}</p>
        </section>
      ) : null}

      {entry.caution ? (
        <section className="space-y-2 border border-[color:var(--warning)]/50 px-3 py-3">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--warning)]">
            Caution
          </h2>
          <p className="text-[15px] leading-relaxed">{entry.caution}</p>
        </section>
      ) : null}

      {entry.supplements?.map((supplement, index) => (
        <section
          key={`${supplement.heading}-${index}`}
          className="space-y-2 border-t border-[color:var(--screen-muted)]/30 pt-4"
        >
          <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
            {supplement.heading}
          </h2>
          {supplement.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-[15px] leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <RelatedEntries topics={related} onSelect={onRelated} disabled={busy} />

      <section className="space-y-2">
        <button
          type="button"
          className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)] underline-offset-2 hover:underline"
          onClick={() => setSourcesOpen((open) => !open)}
        >
          Sources {sourcesOpen ? "▴" : "▾"}
        </button>
        {sourcesOpen ? (
          entry.sources.length ? (
            <ul className="space-y-2 text-sm">
              {entry.sources.map((source) => (
                <li key={`${source.title}-${source.url}`}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[color:var(--highlight)] underline-offset-2"
                  >
                    {source.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[color:var(--screen-muted)]">
              Sources not yet verified.
            </p>
          )
        ) : null}
      </section>

      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--screen-muted)]">
        Last updated {updatedLabel}
      </p>

      <div className="grid gap-2">
        <SavedEntryButton entry={entry} />
        <ReadAloudButton entry={entry} />
      </div>

      <form
        onSubmit={handleFollowUp}
        className="space-y-3 border-t border-[color:var(--screen-muted)]/30 pt-5"
      >
        <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
          Request clarification from the Guide
        </h2>
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={busy}
          rows={3}
          placeholder="Do they actually eat the leaves?"
          className="lookup-field w-full px-3 py-3 text-sm text-[color:var(--screen-text)] placeholder:text-[color:var(--screen-muted)]"
        />
        <PlasticButton
          type="submit"
          fullWidth
          disabled={busy || !question.trim()}
        >
          Ask a follow-up
        </PlasticButton>
        {error ? (
          <p className="text-sm text-[color:var(--warning)]">{error}</p>
        ) : null}
        {busy ? (
          <p className="loading-pulse text-xs uppercase tracking-[0.14em] text-[color:var(--screen-muted)]">
            Amending entry…
          </p>
        ) : null}
      </form>
    </article>
  );
}
