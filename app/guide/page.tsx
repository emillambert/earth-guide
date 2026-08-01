"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { SearchPanel } from "@/components/SearchPanel";
import { PlasticButton } from "@/components/PlasticButton";
import { LoadingDisplay } from "@/components/LoadingDisplay";
import { InstallPrompt } from "@/components/InstallPrompt";
import { fetchLocalEntry } from "@/lib/apiClient";
import { requestCoordinates, reverseGeocode } from "@/lib/location";
import { cacheEntry, setSoundEnabled } from "@/lib/storage";
import { beginEntryGeneration } from "@/lib/pendingEntries";
import { useAppState } from "@/lib/useAppState";
import type { GuideEntry } from "@/types/guide";
import { EDITORIAL_STATUS_LINES } from "@/lib/prompts";

export default function IndexPage() {
  const router = useRouter();
  const state = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  const statusLine = useMemo(
    () => EDITORIAL_STATUS_LINES[statusIndex % EDITORIAL_STATUS_LINES.length],
    [statusIndex],
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setStatusIndex((value) => value + 1);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  function openEntry(entry: GuideEntry) {
    cacheEntry(entry);
    router.push(`/entry/${entry.id}`);
  }

  function consult(query: string) {
    const id = beginEntryGeneration({ query });
    router.push(`/entry/${id}`);
  }

  function surprise() {
    const id = beginEntryGeneration({ surprise: true });
    router.push(`/entry/${id}`);
  }

  async function localEntry() {
    setLoading(true);
    setError(null);
    try {
      const coords = await requestCoordinates();
      const placeName = await reverseGeocode(coords.latitude, coords.longitude);
      const entry = await fetchLocalEntry({
        ...coords,
        placeName,
      });
      openEntry(entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Local entry failed.");
      setLoading(false);
    }
  }

  return (
    <GuideShell footer={statusLine}>
      <GuideScreen>
        {loading ? (
          <LoadingDisplay label="Consulting index" />
        ) : (
          <div className="terminal-enter space-y-6 pb-4">
            <header className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--screen-muted)]">
                Edition 42.1 — Earth Field Supplement
              </p>
              <h1 className="text-3xl font-semibold uppercase tracking-[0.08em]">
                The Guide
              </h1>
              <p className="text-sm uppercase tracking-[0.12em] text-[color:var(--screen-muted)]">
                Look up anything
              </p>
            </header>

            <SearchPanel onSubmit={consult} disabled={loading} />

            <div className="grid gap-2">
              <PlasticButton fullWidth onClick={() => void localEntry()}>
                Local entry
              </PlasticButton>
              <PlasticButton
                fullWidth
                variant="secondary"
                onClick={() => router.push("/identify")}
              >
                Identify
              </PlasticButton>
              <PlasticButton
                fullWidth
                variant="secondary"
                onClick={surprise}
              >
                Surprise me
              </PlasticButton>
            </div>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
                  Recently consulted
                </h2>
                <Link
                  href="/saved"
                  className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--screen-muted)] underline-offset-2 hover:underline"
                >
                  Saved entries
                </Link>
              </div>
              {state.recentEntries.length ? (
                <ul className="space-y-2">
                  {state.recentEntries.slice(0, 8).map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/entry/${entry.id}`)}
                        className="w-full border border-[color:var(--screen-muted)]/30 px-3 py-3 text-left text-sm uppercase tracking-[0.04em] hover:bg-[color:var(--screen-deep)]"
                      >
                        • {entry.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[color:var(--screen-muted)]">
                  No recent entries. Consult something ordinary.
                </p>
              )}
            </section>

            <label className="flex items-start gap-3 text-xs uppercase tracking-[0.12em] text-[color:var(--screen-muted)]">
              <input
                type="checkbox"
                checked={state.soundEnabled}
                onChange={(event) => {
                  setSoundEnabled(event.target.checked);
                }}
                className="mt-0.5 h-4 w-4 accent-[color:var(--highlight)]"
              />
              <span>Button click sounds</span>
            </label>

            <InstallPrompt />

            {error ? (
              <p className="border border-[color:var(--warning)]/50 px-3 py-2 text-sm text-[color:var(--warning)]">
                {error}
              </p>
            ) : null}

            <Link
              href="/cover"
              className="inline-block text-[10px] uppercase tracking-[0.16em] text-[color:var(--screen-muted)] underline-offset-2 hover:underline"
            >
              Return to cover
            </Link>
          </div>
        )}
      </GuideScreen>
    </GuideShell>
  );
}
