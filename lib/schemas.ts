import { z } from "zod";

export const guideSourceSchema = z.object({
  title: z.string(),
  url: z.string(),
});

/** Stage 1: plain facts */
export const factualDraftSchema = z.object({
  title: z.string(),
  draft: z.string().min(1),
  uncertainties: z.string(),
  safetyInformation: z.string(),
  highRisk: z.boolean(),
  confidence: z.number().min(0).max(100).optional().nullable(),
  sources: z.array(guideSourceSchema),
});

/** Stage 2: Guide voice rewrite (matches product prompt) */
export const guideRewriteSchema = z.object({
  title: z.string(),
  opening: z.string(),
  paragraphs: z.array(z.string()).min(1).max(6),
  travellerAdvisory: z.string().optional().nullable(),
  caution: z.string().optional().nullable(),
  editorialNote: z.string().optional().nullable(),
  relatedEntries: z.array(z.string()).min(2).max(8),
});

export const followUpSchema = z.object({
  heading: z.string(),
  body: z.array(z.string()).min(1).max(4),
  relatedEntries: z.array(z.string()).max(6).optional().nullable(),
});

export type FactualDraft = z.infer<typeof factualDraftSchema>;
export type GuideRewrite = z.infer<typeof guideRewriteSchema>;
export type GeneratedFollowUp = z.infer<typeof followUpSchema>;

export const factualDraftJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    draft: { type: "string" },
    uncertainties: { type: "string" },
    safetyInformation: { type: "string" },
    highRisk: { type: "boolean" },
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
  },
  required: [
    "title",
    "draft",
    "uncertainties",
    "safetyInformation",
    "highRisk",
    "confidence",
    "sources",
  ],
} as const;

export const guideRewriteJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    title: { type: "string" },
    opening: { type: "string" },
    paragraphs: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 6,
    },
    travellerAdvisory: { type: ["string", "null"] },
    caution: { type: ["string", "null"] },
    editorialNote: { type: ["string", "null"] },
    relatedEntries: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 8,
    },
  },
  required: [
    "title",
    "opening",
    "paragraphs",
    "travellerAdvisory",
    "caution",
    "editorialNote",
    "relatedEntries",
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
