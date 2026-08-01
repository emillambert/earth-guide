export type GuideSource = {
  title: string;
  url: string;
};

export type GuideSupplement = {
  heading: string;
  body: string[];
  relatedEntries?: string[];
};

export type GuideEntry = {
  id: string;
  title: string;
  verdict: string;
  body: string[];
  travellerNote?: string;
  caution?: string;
  relatedEntries: string[];
  confidence?: number;
  sources: GuideSource[];
  generatedAt: string;
  supplements?: GuideSupplement[];
  query?: string;
  kind?: "lookup" | "local" | "identify" | "surprise";
  highRisk?: boolean;
};

export type SavedGuideEntry = GuideEntry & {
  savedAt: string;
};

export type AppState = {
  recentEntries: GuideEntry[];
  savedEntries: SavedGuideEntry[];
  hasOpenedGuide: boolean;
  soundEnabled: boolean;
  skipCover: boolean;
  entryCache: Record<string, GuideEntry>;
};

export type FollowUpResponse = {
  supplement: GuideSupplement;
};
