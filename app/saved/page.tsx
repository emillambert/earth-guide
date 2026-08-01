"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { PlasticButton } from "@/components/PlasticButton";
import { removeSavedEntry } from "@/lib/storage";
import { useAppState } from "@/lib/useAppState";

export default function SavedPage() {
  const router = useRouter();
  const state = useAppState();
  const [query, setQuery] = useState("");

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
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/guide"
              className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--screen-muted)] underline-offset-2 hover:underline"
            >
              ← Index
            </Link>
          </div>

          <header className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--screen-muted)]">
              Local archive
            </p>
            <h1 className="text-2xl font-semibold uppercase tracking-[0.06em]">
              Personal copy of the Guide
            </h1>
            <p className="text-sm text-[color:var(--screen-muted)]">
              Saved entries kept on this device. No accounts. No syncing.
            </p>
          </header>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search saved entries"
            className="lookup-field w-full min-h-12 px-3 py-3 text-sm"
          />

          {filtered.length ? (
            <ul className="space-y-3">
              {filtered.map((entry) => (
                <li
                  key={entry.id}
                  className="border border-[color:var(--screen-muted)]/30 px-3 py-3"
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => router.push(`/entry/${entry.id}`)}
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
                  <div className="mt-3">
                    <PlasticButton
                      fullWidth
                      variant="secondary"
                      onClick={() => removeSavedEntry(entry.id)}
                    >
                      Remove
                    </PlasticButton>
                  </div>
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
        </div>
      </GuideScreen>
    </GuideShell>
  );
}
