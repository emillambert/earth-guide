"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { SearchPanel } from "@/components/SearchPanel";
import { PlasticButton } from "@/components/PlasticButton";
import { InstallPrompt } from "@/components/InstallPrompt";
import { cacheEntry, setSoundEnabled } from "@/lib/storage";
import { beginEntryGeneration } from "@/lib/pendingEntries";
import { useAppState } from "@/lib/useAppState";
import type { GuideEntry } from "@/types/guide";

export default function IndexPage() {
  const router = useRouter();
  const state = useAppState();

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

  function localEntry() {
    const id = beginEntryGeneration({ local: true });
    router.push(`/entry/${id}`);
  }

  return (
    <GuideShell>
      <GuideScreen>
        <div className="terminal-enter space-y-7 pb-4">
            <header className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--screen-muted)]">
                Current supplement
              </p>
              <h1
                data-page-heading
                tabIndex={-1}
                className="text-2xl font-semibold uppercase tracking-[0.06em]"
              >
                Earth index
              </h1>
              <p className="text-sm leading-relaxed text-[color:var(--screen-muted)]">
                Ask about a place, object, custom, creature, or avoidable mistake.
              </p>
            </header>

            <SearchPanel onSubmit={consult} />

            <section className="space-y-2">
              <h2 className="text-xs uppercase tracking-[0.16em] text-[color:var(--screen-muted)]">
                Field tools
              </h2>
              <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-3">
              <PlasticButton
                variant="secondary"
                className="px-2 text-xs"
                onClick={localEntry}
              >
                Nearby
              </PlasticButton>
              <PlasticButton
                variant="secondary"
                className="px-2 text-xs"
                onClick={() => router.push("/identify")}
              >
                Identify
              </PlasticButton>
              <PlasticButton
                variant="secondary"
                className="col-span-2 px-2 text-xs min-[360px]:col-span-1"
                onClick={surprise}
              >
                Surprise
              </PlasticButton>
              </div>
            </section>

            <InstallPrompt />

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
                  Recent
                </h2>
                <Link
                  href="/saved"
                  className="inline-flex min-h-11 items-center px-2 text-xs uppercase tracking-[0.12em] text-[color:var(--screen-muted)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]"
                >
                  Saved →
                </Link>
              </div>
              {state.recentEntries.length ? (
                <ul className="space-y-2">
                  {state.recentEntries.slice(0, 8).map((entry) => (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => openEntry(entry)}
                        className="flex min-h-12 w-full items-center border-b border-[color:var(--screen-muted)]/25 px-2 py-3 text-left text-sm hover:bg-[color:var(--screen-deep)] focus-visible:outline-2 focus-visible:outline-[color:var(--highlight)]"
                      >
                        {entry.title}
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

            <details className="border-t border-[color:var(--screen-muted)]/25 pt-3">
              <summary className="flex min-h-11 cursor-pointer items-center text-xs uppercase tracking-[0.14em] text-[color:var(--screen-muted)]">
                Terminal settings
              </summary>
              <div className="space-y-4 pb-2 pt-2">
                <label className="flex min-h-12 items-center gap-3 text-xs uppercase tracking-[0.1em] text-[color:var(--screen-muted)]">
                  <input
                    type="checkbox"
                    checked={state.soundEnabled}
                    onChange={(event) => {
                      setSoundEnabled(event.target.checked);
                    }}
                    className="h-5 w-5 shrink-0 accent-[color:var(--highlight)]"
                  />
                  <span>Button click sounds</span>
                </label>
                <Link
                  href="/cover"
                  className="inline-flex min-h-11 items-center text-xs uppercase tracking-[0.12em] text-[color:var(--screen-muted)] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]"
                >
                  View cover
                </Link>
              </div>
            </details>
        </div>
      </GuideScreen>
    </GuideShell>
  );
}
