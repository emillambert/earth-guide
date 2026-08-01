import OpenAI from "openai";
import { randomUUID } from "crypto";
import {
  followUpJsonSchema,
  followUpSchema,
  guideEntryJsonSchema,
  guideEntrySchema,
  type GeneratedFollowUp,
  type GeneratedGuideEntry,
} from "@/lib/schemas";
import {
  ENTRY_USER_PROMPT,
  FOLLOW_UP_PROMPT,
  IDENTIFY_PROMPT,
  LOCAL_ENTRY_PROMPT,
  SYSTEM_PROMPT,
} from "@/lib/prompts";
import type { GuideEntry, GuideSupplement } from "@/types/guide";

// GPT-5.6 Luna via OpenAI Responses API. Override with OPENAI_MODEL if needed.
const MODEL = process.env.OPENAI_MODEL ?? "gpt-5.6-luna";

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
  sources: GeneratedGuideEntry["sources"],
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

function toGuideEntry(
  generated: GeneratedGuideEntry,
  extras: Partial<GuideEntry> = {},
): GuideEntry {
  const confidence =
    generated.confidence === null || generated.confidence === undefined
      ? undefined
      : Math.round(generated.confidence);

  return {
    id: extras.id ?? randomUUID(),
    title: generated.title.trim(),
    verdict: generated.verdict.trim(),
    body: generated.body.map((p) => p.trim()).filter(Boolean),
    travellerNote: generated.travellerNote?.trim() || undefined,
    caution: generated.caution?.trim() || undefined,
    relatedEntries: generated.relatedEntries.map((r) => r.trim()).filter(Boolean),
    confidence,
    sources: sanitizeSources(generated.sources),
    generatedAt: extras.generatedAt ?? new Date().toISOString(),
    supplements: extras.supplements,
    query: extras.query,
    kind: extras.kind,
    highRisk: Boolean(generated.highRisk) || Boolean(extras.highRisk),
  };
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

export async function generateEntry(query: string): Promise<GuideEntry> {
  const text = await createStructuredJson(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: ENTRY_USER_PROMPT(query) },
    ],
    "guide_entry",
    guideEntryJsonSchema as unknown as Record<string, unknown>,
  );

  const parsed = guideEntrySchema.parse(JSON.parse(text));
  return toGuideEntry(parsed, { query, kind: "lookup" });
}

export async function generateLocalEntry(input: {
  latitude: number;
  longitude: number;
  placeName: string;
}): Promise<GuideEntry> {
  const text = await createStructuredJson(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: LOCAL_ENTRY_PROMPT(
          input.placeName,
          input.latitude,
          input.longitude,
        ),
      },
    ],
    "guide_entry",
    guideEntryJsonSchema as unknown as Record<string, unknown>,
  );

  const parsed = guideEntrySchema.parse(JSON.parse(text));
  return toGuideEntry(parsed, {
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

  const text = await createStructuredJson(
    [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "input_text", text: IDENTIFY_PROMPT(input.question) },
          {
            type: "input_image",
            image_url: `data:${mimeType};base64,${base64}`,
            detail: "auto",
          },
        ],
      },
    ],
    "guide_entry",
    guideEntryJsonSchema as unknown as Record<string, unknown>,
  );

  const parsed = guideEntrySchema.parse(JSON.parse(text));
  if (parsed.confidence === null || parsed.confidence === undefined) {
    parsed.confidence = 55;
  }

  return toGuideEntry(parsed, {
    query: input.question || "Visual identification",
    kind: "identify",
  });
}

export async function generateFollowUp(
  entry: GuideEntry,
  question: string,
): Promise<GuideSupplement> {
  const compact = {
    title: entry.title,
    verdict: entry.verdict,
    body: entry.body,
    travellerNote: entry.travellerNote,
    caution: entry.caution,
    relatedEntries: entry.relatedEntries,
  };

  const text = await createStructuredJson(
    [
      { role: "system", content: SYSTEM_PROMPT },
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
