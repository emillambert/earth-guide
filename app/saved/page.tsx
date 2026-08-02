"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { PlasticButton } from "@/components/PlasticButton";
import { PageNav } from "@/components/PageNav";
import { Notice } from "@/components/Notice";
import {
  cacheEntry,
  clearGuideCopies,
  removeSavedEntry,
  restoreSavedEntry,
} from "@/lib/storage";
import { useAppState } from "@/lib/useAppState";
import type { SavedGuideEntry } from "@/types/guide";

export default function SavedPage() {
  const state = useAppState();
  const [query, setQuery] = useState("");
  const [removedEntry, setRemovedEntry] = useState<SavedGuideEntry | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const undoRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const clearTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!removedEntry) return;
    undoRef.current?.focus();
    const timer = window.setTimeout(() => {
      if (document.activeElement !== undoRef.current) setRemovedEntry(null);
    }, 7000);
    return () => window.clearTimeout(timer);
  }, [removedEntry]);

  function focusArchiveHeading() {
    window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
  }

  function closeClearConfirmation() {
    setConfirmClear(false);
    window.requestAnimationFrame(() => {
      clearTriggerRef.current?.focus({ preventScroll: true });
    });
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return state.savedEntries;
    return state.savedEntries.filter((entry) => {
      const haystack = [
        entry.title,
        entry.verdict,
        ...entry.body,
        entry.query ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [state.savedEntries, query]);

  return (
    <GuideShell>
      <GuideScreen>
        <div className="terminal-enter space-y-5 pb-4">
          <PageNav />

          <header className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--screen-muted)]">
              Local archive
            </p>
            <h1
              ref={headingRef}
              data-page-heading
              tabIndex={-1}
              className="text-2xl font-semibold uppercase tracking-[0.06em]"
            >
              Saved entries
            </h1>
            <p className="text-sm text-[color:var(--screen-muted)]">
              Saved entries kept on this device. No accounts. No syncing.
            </p>
          </header>

          <label htmlFor="saved-search" className="sr-only">
            Search saved entries
          </label>
          <input
            id="saved-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved entries"
            className="lookup-field min-h-12 w-full px-3 py-3 text-base"
          />

          {removedEntry ? (
            <Notice tone="muted" role="status" className="flex items-center justify-between gap-3">
              <span>Removed “{removedEntry.title}”.</span>
              <button
                ref={undoRef}
                type="button"
                className="inline-flex min-h-11 shrink-0 items-center text-xs uppercase tracking-[0.12em] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]"
                onClick={() => {
                  restoreSavedEntry(removedEntry);
                  setRemovedEntry(null);
                  focusArchiveHeading();
                }}
              >
                Undo
              </button>
            </Notice>
          ) : null}

          {filtered.length ? (
            <ul className="space-y-3">
              {filtered.map((entry) => (
                <li
                  key={entry.id}
                  className="border border-[color:var(--screen-muted)]/30 px-3 py-3"
                >
                  <button
                    type="button"
                    className="min-h-11 w-full text-left focus-visible:outline-2 focus-visible:outline-[color:var(--highlight)]"
                    onClick={() => {
                      cacheEntry(entry);
                      window.location.assign(`/entry/${entry.id}`);
                    }}
                  >
                    <p className="text-sm uppercase tracking-[0.05em]">
                      {entry.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[color:var(--screen-muted)]">
                      {entry.verdict}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[color:var(--screen-muted)]">
                      Saved{" "}
                      {new Date(entry.savedAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  </button>
                  <button
                    type="button"
                    className="mt-2 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.12em] text-[color:var(--warning)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]"
                    onClick={() => {
                      setRemovedEntry(entry);
                      removeSavedEntry(entry.id);
                    }}
                  >
                    Remove bookmark
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[color:var(--screen-muted)]">
              {state.savedEntries.length
                ? "No saved entries match that search."
                : "Nothing saved yet. Bookmark an entry after consulting the Guide."}
            </p>
          )}

          {(state.savedEntries.length > 0 || state.recentEntries.length > 0) && (
            <details className="border-t border-[color:var(--screen-muted)]/25 pt-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-xs uppercase tracking-[0.14em] text-[color:var(--screen-muted)]">
                Device storage
              </summary>
              <div className="space-y-2 pt-2">
                <p className="text-xs leading-relaxed text-[color:var(--screen-muted)]">
                  Clears saved entries and recent consultation history from this
                  device.
                </p>
                {confirmClear ? (
                  <Notice>
                    <p>
                      Clear every saved entry and recent consultation from this
                      device? This cannot be undone.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <PlasticButton
                        autoFocus
                        variant="secondary"
                        onClick={closeClearConfirmation}
                      >
                        Keep copies
                      </PlasticButton>
                      <PlasticButton
                        variant="warning"
                        onClick={() => {
                          clearGuideCopies();
                          setQuery("");
                          setRemovedEntry(null);
                          setConfirmClear(false);
                          focusArchiveHeading();
                        }}
                      >
                        Clear all
                      </PlasticButton>
                    </div>
                  </Notice>
                ) : (
                  <PlasticButton
                    ref={clearTriggerRef}
                    fullWidth
                    variant="warning"
                    onClick={() => setConfirmClear(true)}
                  >
                    Clear device history
                  </PlasticButton>
                )}
              </div>
            </details>
          )}
        </div>
      </GuideScreen>
    </GuideShell>
  );
}
