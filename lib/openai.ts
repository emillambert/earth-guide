import OpenAI from "openai";
import { randomUUID } from "crypto";
import {
  factualDraftJsonSchema,
  factualDraftSchema,
  followUpJsonSchema,
  followUpSchema,
  guideRewriteJsonSchema,
  guideRewriteSchema,
  type FactualDraft,
  type GeneratedFollowUp,
  type GuideRewrite,
} from "@/lib/schemas";
import {
  FACTUAL_DRAFT_SYSTEM,
  FACTUAL_IDENTIFY_USER,
  FOLLOW_UP_PROMPT,
  FOLLOW_UP_SYSTEM,
  GUIDE_DIRECT_USER,
  GUIDE_REWRITE_SYSTEM,
  GUIDE_REWRITE_USER,
} from "@/lib/prompts";
import type { GuideEntry, GuideSupplement } from "@/types/guide";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6-sol";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to the environment to consult the Guide.",
    );
  }
  return new OpenAI({ apiKey });
}

function extractOutputText(response: OpenAI.Responses.Response): string {
  if (typeof response.output_text === "string" && response.output_text.trim()) {
    return response.output_text;
  }

  const chunks: string[] = [];
  for (const item of response.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

function sanitizeSources(
  sources: FactualDraft["sources"],
): GuideEntry["sources"] {
  return sources
    .filter((source) => {
      try {
        const url = new URL(source.url);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    })
    .map((source) => ({
      title: source.title.trim() || "Source",
      url: source.url,
    }));
}

async function createStructuredJson(
  input: OpenAI.Responses.ResponseCreateParams["input"],
  schemaName: string,
  schema: Record<string, unknown>,
): Promise<string> {
  const client = getClient();
  const response = await client.responses.create({
    model: MODEL,
    input,
    text: {
      format: {
        type: "json_schema",
        name: schemaName,
        strict: true,
        schema,
      },
    },
  });

  const text = extractOutputText(response);
  if (!text) {
    throw new Error("The Guide returned an empty response.");
  }
  return text;
}

async function draftFacts(
  userContent: OpenAI.Responses.ResponseInputMessageContentList | string,
): Promise<FactualDraft> {
  const content =
    typeof userContent === "string"
      ? userContent
      : userContent;

  const text = await createStructuredJson(
    [
      { role: "system", content: FACTUAL_DRAFT_SYSTEM },
      {
        role: "user",
        content,
      },
    ],
    "factual_draft",
    factualDraftJsonSchema as unknown as Record<string, unknown>,
  );

  return factualDraftSchema.parse(JSON.parse(text));
}

async function rewriteGuideVoice(input: {
  userQuestion: string;
  draft: FactualDraft;
}): Promise<GuideRewrite> {
  const text = await createStructuredJson(
    [
      { role: "system", content: GUIDE_REWRITE_SYSTEM },
      {
        role: "user",
        content: GUIDE_REWRITE_USER({
          userQuestion: input.userQuestion,
          factualDraft: `${input.draft.title}\n\n${input.draft.draft}`,
          uncertainties: input.draft.uncertainties,
          safetyInformation: input.draft.safetyInformation,
        }),
      },
    ],
    "guide_rewrite",
    guideRewriteJsonSchema as unknown as Record<string, unknown>,
  );

  return guideRewriteSchema.parse(JSON.parse(text));
}

async function writeGuideEntry(userQuestion: string): Promise<GuideRewrite> {
  const text = await createStructuredJson(
    [
      { role: "system", content: GUIDE_REWRITE_SYSTEM },
      { role: "user", content: GUIDE_DIRECT_USER(userQuestion) },
    ],
    "guide_entry",
    guideRewriteJsonSchema as unknown as Record<string, unknown>,
  );

  return guideRewriteSchema.parse(JSON.parse(text));
}

function toGuideEntry(
  rewrite: GuideRewrite,
  draft: FactualDraft | null,
  extras: Partial<GuideEntry> = {},
): GuideEntry {
  const confidence =
    draft?.confidence === null || draft?.confidence === undefined
      ? extras.confidence
      : Math.round(draft.confidence);

  // Prefer draft safety text if rewrite omitted caution on a high-risk topic.
  const caution =
    rewrite.caution?.trim() ||
    (draft?.highRisk ? draft.safetyInformation.trim() : "") ||
    undefined;

  return {
    id: extras.id ?? randomUUID(),
    title: rewrite.title.trim() || draft?.title.trim() || "Guide Entry",
    verdict: rewrite.opening.trim(),
    body: rewrite.paragraphs.map((p) => p.trim()).filter(Boolean),
    travellerNote: rewrite.travellerAdvisory?.trim() || undefined,
    caution: caution || undefined,
    editorialNote: rewrite.editorialNote?.trim() || undefined,
    relatedEntries: rewrite.relatedEntries.map((r) => r.trim()).filter(Boolean),
    confidence,
    sources: draft ? sanitizeSources(draft.sources) : [],
    generatedAt: extras.generatedAt ?? new Date().toISOString(),
    supplements: extras.supplements,
    query: extras.query,
    kind: extras.kind,
    highRisk:
      Boolean(draft?.highRisk) ||
      Boolean(extras.highRisk) ||
      Boolean(rewrite.caution?.trim()),
  };
}

async function generateDirectFromQuestion(
  userQuestion: string,
  extras: Partial<GuideEntry>,
): Promise<GuideEntry> {
  const rewrite = await writeGuideEntry(userQuestion);
  return toGuideEntry(rewrite, null, extras);
}

export async function generateEntry(query: string): Promise<GuideEntry> {
  return generateDirectFromQuestion(query, {
    query,
    kind: "lookup",
  });
}

export async function generateLocalEntry(input: {
  latitude: number;
  longitude: number;
  placeName: string;
}): Promise<GuideEntry> {
  const question = `What should a traveller know about ${input.placeName}? The supplied coordinates are ${input.latitude}, ${input.longitude}.`;
  return generateDirectFromQuestion(question, {
    query: input.placeName,
    kind: "local",
  });
}

export async function generateIdentifyEntry(input: {
  imageDataUrl: string;
  question?: string;
}): Promise<GuideEntry> {
  const match = /^data:(.+);base64,(.+)$/.exec(input.imageDataUrl);
  if (!match) {
    throw new Error("Image must be provided as a data URL.");
  }
  const mimeType = match[1] ?? "image/jpeg";
  const base64 = match[2] ?? "";
  const question = input.question?.trim() || "What is this?";

  const draft = await draftFacts([
    { type: "input_text", text: FACTUAL_IDENTIFY_USER(input.question) },
    {
      type: "input_image",
      image_url: `data:${mimeType};base64,${base64}`,
      detail: "auto",
    },
  ]);

  if (draft.confidence === null || draft.confidence === undefined) {
    draft.confidence = 55;
  }

  const rewrite = await rewriteGuideVoice({ userQuestion: question, draft });
  return toGuideEntry(rewrite, draft, {
    query: question,
    kind: "identify",
  });
}

export async function generateFollowUp(
  entry: GuideEntry,
  question: string,
): Promise<GuideSupplement> {
  const compact = {
    title: entry.title,
    opening: entry.verdict,
    paragraphs: entry.body,
    travellerAdvisory: entry.travellerNote ?? null,
    caution: entry.caution ?? null,
    editorialNote: entry.editorialNote ?? null,
    relatedEntries: entry.relatedEntries,
  };

  const text = await createStructuredJson(
    [
      { role: "system", content: FOLLOW_UP_SYSTEM },
      {
        role: "user",
        content: FOLLOW_UP_PROMPT(JSON.stringify(compact), question),
      },
    ],
    "guide_follow_up",
    followUpJsonSchema as unknown as Record<string, unknown>,
  );

  const parsed: GeneratedFollowUp = followUpSchema.parse(JSON.parse(text));
  return {
    heading: parsed.heading.trim() || "Supplementary Note",
    body: parsed.body.map((p) => p.trim()).filter(Boolean),
    relatedEntries:
      parsed.relatedEntries
        ?.map((r) => r.trim())
        .filter(Boolean)
        .slice(0, 6) ?? [],
  };
}
