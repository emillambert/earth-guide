import { z } from "zod";

export const guideSourceSchema = z.object({
  title: z.string(),
  url: z.string(),
});

export const guideEntrySchema = z.object({
  title: z.string(),
  verdict: z.string(),
  body: z.array(z.string()).min(1).max(6),
  travellerNote: z.string().optional().nullable(),
  caution: z.string().optional().nullable(),
  relatedEntries: z.array(z.string()).min(2).max(8),
  confidence: z.number().min(0).max(100).optional().nullable(),
  sources: z.array(guideSourceSchema),
  highRisk: z.boolean().optional().nullable(),
});

export const followUpSchema = z.object({
  heading: z.string(),
  body: z.array(z.string()).min(1).max(4),
  relatedEntries: z.array(z.string()).max(6).optional().nullable(),
});

export type GeneratedGuideEntry = z.infer<typeof guideEntrySchema>;
export type GeneratedFollowUp = z.infer<typeof followUpSchema>;

/** JSON Schema for OpenAI structured outputs (strict mode). */
export const guideEntryJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    verdict: { type: "string" },
    body: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 6,
    },
    travellerNote: { type: ["string", "null"] },
    caution: { type: ["string", "null"] },
    relatedEntries: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 8,
    },
    confidence: { type: ["number", "null"] },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
        required: ["title", "url"],
      },
    },
    highRisk: { type: ["boolean", "null"] },
  },
  required: [
    "title",
    "verdict",
    "body",
    "travellerNote",
    "caution",
    "relatedEntries",
    "confidence",
    "sources",
    "highRisk",
  ],
} as const;

export const followUpJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    heading: { type: "string" },
    body: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 4,
    },
    relatedEntries: {
      type: ["array", "null"],
      items: { type: "string" },
      maxItems: 6,
    },
  },
  required: ["heading", "body", "relatedEntries"],
} as const;
