"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { RelatedEntries } from "@/components/RelatedEntries";
import { SavedEntryButton } from "@/components/SavedEntryButton";
import { ReadAloudButton } from "@/components/ReadAloudButton";
import { PlasticButton } from "@/components/PlasticButton";
import { Notice } from "@/components/Notice";
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
  const [followUpStatus, setFollowUpStatus] = useState("");
  const supplementCount = entry.supplements?.length ?? 0;
  const previousSupplementCount = useRef(supplementCount);
  const latestSupplementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (supplementCount > previousSupplementCount.current) {
      setFollowUpStatus("Supplement added.");
      const frame = window.requestAnimationFrame(() => {
        latestSupplementRef.current?.focus({ preventScroll: true });
        latestSupplementRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
      previousSupplementCount.current = supplementCount;
      return () => window.cancelAnimationFrame(frame);
    }
    previousSupplementCount.current = supplementCount;
  }, [supplementCount]);

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
    setFollowUpStatus("");
    try {
      await onFollowUp(trimmed);
      setQuestion("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Follow-up failed.");
    }
  }

  return (
    <article className="entry-resolved space-y-6 pb-6">
      <header className="space-y-2 border-b border-[color:var(--screen-muted)]/30 pb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--screen-muted)]">
          Guide entry
        </p>
        <h1
          data-page-heading
          tabIndex={-1}
          className="text-2xl font-semibold uppercase leading-tight tracking-[0.04em]"
        >
          {entry.title}
        </h1>
        {entry.kind === "identify" && typeof entry.confidence === "number" ? (
          <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--screen-muted)]">
            Identification confidence: {Math.round(entry.confidence)}%
          </p>
        ) : null}
        <p className="text-base leading-relaxed text-[color:var(--screen-text)]">
          {entry.verdict}
        </p>
      </header>

      {entry.highRisk && !entry.caution ? (
        <Notice role="status">
          This entry is general information, not emergency or professional
          guidance.
        </Notice>
      ) : null}

      <div className="space-y-3 text-[15px] leading-relaxed">
        {entry.body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>

      {entry.travellerNote ? (
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
            Traveller&apos;s advisory
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

      {entry.editorialNote ? (
        <section className="space-y-2 border border-[color:var(--screen-muted)]/35 px-3 py-3">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
            Editorial note
          </h2>
          <p className="text-[15px] leading-relaxed">{entry.editorialNote}</p>
        </section>
      ) : null}

      {entry.supplements?.map((supplement, index) => (
        <section
          key={`${supplement.heading}-${index}`}
          ref={index === supplementCount - 1 ? latestSupplementRef : undefined}
          tabIndex={index === supplementCount - 1 ? -1 : undefined}
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
          aria-expanded={sourcesOpen}
          aria-controls="entry-sources"
          className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.16em] text-[color:var(--screen-muted)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]"
          onClick={() => setSourcesOpen((open) => !open)}
        >
          Sources {sourcesOpen ? "▴" : "▾"}
        </button>
        {sourcesOpen ? (
          <div id="entry-sources">
            {entry.sources.length ? (
              <ul className="space-y-2 text-sm">
                {entry.sources.map((source) => (
                  <li key={`${source.title}-${source.url}`}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-1 underline decoration-[color:var(--highlight)] underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]"
                    >
                      {source.title}
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens externally)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[color:var(--screen-muted)]">
                Sources not yet verified.
              </p>
            )}
          </div>
        ) : null}
      </section>

      <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--screen-muted)]">
        Last updated {updatedLabel}
      </p>

      <div className="grid gap-2">
        <SavedEntryButton entry={entry} disabled={busy} />
        <ReadAloudButton entry={entry} disabled={busy} />
      </div>

      <form
        onSubmit={handleFollowUp}
        className="space-y-3 border-t border-[color:var(--screen-muted)]/30 pt-5"
      >
        <label
          htmlFor="follow-up-question"
          className="block text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]"
        >
          Request clarification from the Guide
        </label>
        <textarea
          id="follow-up-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          disabled={busy}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "follow-up-error" : undefined}
          rows={3}
          placeholder="Do they actually eat the leaves?"
          className="lookup-field w-full px-3 py-3 text-base text-[color:var(--screen-text)] placeholder:text-[color:var(--screen-muted)]"
        />
        <PlasticButton
          type="submit"
          fullWidth
          disabled={busy || !question.trim()}
        >
          Ask a follow-up
        </PlasticButton>
        {error ? (
          <Notice id="follow-up-error">{error}</Notice>
        ) : null}
        {busy ? (
          <p className="loading-pulse text-xs uppercase tracking-[0.14em] text-[color:var(--screen-muted)]">
            Amending entry…
          </p>
        ) : null}
        <p role="status" aria-live="polite" className="sr-only">
          {followUpStatus}
        </p>
      </form>
    </article>
  );
}
