import { NextResponse } from "next/server";
import { generateFollowUp } from "@/lib/openai";
import type { GuideEntry } from "@/types/guide";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      entry?: GuideEntry;
      question?: string;
    };

    if (!body.entry?.id || !body.question?.trim()) {
      return NextResponse.json(
        { error: "An entry and follow-up question are required." },
        { status: 400 },
      );
    }

    const supplement = await generateFollowUp(body.entry, body.question.trim());
    return NextResponse.json({ supplement });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Clarification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
