import type { AppState, GuideEntry, SavedGuideEntry } from "@/types/guide";

const STORAGE_KEY = "hitchhikers-guide-state-v1";
const LEGACY_STORAGE_KEYS = [
  "earth-guide-v7-style-reset",
  "earth-guide-v6-ui-reset",
  "earth-guide-v5-single-pass",
  "earth-guide-v4-rewrite",
  "earth-guide-v3-adams",
  "earth-guide-v1",
];
const MAX_RECENT = 20;
export const STORAGE_EVENT = "earth-guide-storage";
export const STORAGE_ERROR_EVENT = "earth-guide-storage-error";

const DEFAULT_STATE: AppState = {
  recentEntries: [],
  savedEntries: [],
  hasOpenedGuide: false,
  soundEnabled: false,
  skipCover: false,
  entryCache: {},
};

/** Stable server snapshot — must be referentially equal across calls. */
const SERVER_SNAPSHOT: AppState = DEFAULT_STATE;

let cachedRaw: string | null | undefined = undefined;
let cachedState: AppState = DEFAULT_STATE;
let volatileState: AppState | null = null;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function notify(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function prewarmEntryRoute(id: string): void {
  if (
    typeof navigator === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }
  void navigator.serviceWorker.ready
    .then((registration) => {
      registration.active?.postMessage({
        type: "CACHE_ENTRY_ROUTE",
        path: `/entry/${encodeURIComponent(id)}`,
      });
    })
    .catch(() => {
      // Offline route caching is best-effort.
    });
}

function buildState(partial: Partial<AppState> = {}): AppState {
  return {
    hasOpenedGuide: partial.hasOpenedGuide ?? false,
    soundEnabled: partial.soundEnabled ?? false,
    skipCover: partial.skipCover ?? false,
    recentEntries: partial.recentEntries ?? [],
    savedEntries: partial.savedEntries ?? [],
    entryCache: partial.entryCache ?? {},
  };
}

export function loadState(): AppState {
  if (!canUseStorage()) return SERVER_SNAPSHOT;
  if (volatileState) return volatileState;

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_STORAGE_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) {
          try {
            localStorage.setItem(STORAGE_KEY, raw);
          } catch {
            // The legacy copy can still be used for this session.
          }
          break;
        }
      }
    }
    if (raw === cachedRaw) return cachedState;

    cachedRaw = raw;
    if (!raw) {
      cachedState = DEFAULT_STATE;
      return cachedState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    cachedState = buildState(parsed);
    return cachedState;
  } catch {
    cachedRaw = null;
    cachedState = DEFAULT_STATE;
    return cachedState;
  }
}

export function saveState(state: AppState): void {
  if (!canUseStorage()) return;
  const raw = JSON.stringify(state);
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    volatileState = null;
    cachedRaw = raw;
    cachedState = state;
    notify();
  } catch {
    volatileState = state;
    cachedRaw = raw;
    cachedState = state;
    notify();
    window.dispatchEvent(
      new CustomEvent(STORAGE_ERROR_EVENT, {
        detail:
          "Device storage is full or unavailable. Changes will last for this session only.",
      }),
    );
  }
}

export function updateState(updater: (prev: AppState) => AppState): AppState {
  const next = updater(loadState());
  saveState(next);
  return next;
}

export function subscribeToStorage(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onStoreChange();
  window.addEventListener(STORAGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(STORAGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function getServerSnapshot(): AppState {
  return SERVER_SNAPSHOT;
}

export function markGuideOpened(): AppState {
  return updateState((prev) => ({ ...prev, hasOpenedGuide: true }));
}

export function setSkipCover(skipCover: boolean): AppState {
  return updateState((prev) => ({ ...prev, skipCover }));
}

export function setSoundEnabled(soundEnabled: boolean): AppState {
  return updateState((prev) => ({ ...prev, soundEnabled }));
}

export function cacheEntry(entry: GuideEntry): AppState {
  return updateState((prev) => {
    const recent = [
      entry,
      ...prev.recentEntries.filter((item) => item.id !== entry.id),
    ].slice(0, MAX_RECENT);

    const savedEntries = prev.savedEntries.map((item) =>
      item.id === entry.id ? { ...entry, savedAt: item.savedAt } : item,
    );

    return {
      ...prev,
      recentEntries: recent,
      savedEntries,
      entryCache: {
        ...prev.entryCache,
        [entry.id]: entry,
      },
    };
  });
}

export function getEntryById(id: string): GuideEntry | undefined {
  const state = loadState();
  if (state.entryCache[id]) return state.entryCache[id];
  const recent = state.recentEntries.find((entry) => entry.id === id);
  if (recent) return recent;
  return state.savedEntries.find((entry) => entry.id === id);
}

export function saveEntry(entry: GuideEntry): AppState {
  const state = updateState((prev) => {
    const savedAt =
      prev.savedEntries.find((item) => item.id === entry.id)?.savedAt ??
      new Date().toISOString();
    const saved: SavedGuideEntry = { ...entry, savedAt };
    const savedEntries = [
      saved,
      ...prev.savedEntries.filter((item) => item.id !== entry.id),
    ];
    return {
      ...prev,
      savedEntries,
      entryCache: {
        ...prev.entryCache,
        [entry.id]: entry,
      },
    };
  });
  prewarmEntryRoute(entry.id);
  return state;
}

export function removeSavedEntry(id: string): AppState {
  return updateState((prev) => ({
    ...prev,
    savedEntries: prev.savedEntries.filter((entry) => entry.id !== id),
  }));
}

export function restoreSavedEntry(entry: SavedGuideEntry): AppState {
  const state = updateState((prev) => ({
    ...prev,
    savedEntries: [
      entry,
      ...prev.savedEntries.filter((item) => item.id !== entry.id),
    ],
    entryCache: {
      ...prev.entryCache,
      [entry.id]: entry,
    },
  }));
  prewarmEntryRoute(entry.id);
  return state;
}

export function isEntrySaved(id: string): boolean {
  return loadState().savedEntries.some((entry) => entry.id === id);
}

/** Wipe saved/recent/cache while keeping cover/sound preferences. */
export function clearGuideCopies(): AppState {
  return updateState((prev) => ({
    ...prev,
    recentEntries: [],
    savedEntries: [],
    entryCache: {},
  }));
}
