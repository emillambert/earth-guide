import { NextResponse } from "next/server";
import { generateEntry } from "@/lib/openai";
import { pickRandomTopic } from "@/lib/randomTopics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      surprise?: boolean;
    };

    const query = body.surprise
      ? pickRandomTopic()
      : body.query?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "A lookup query is required." },
        { status: 400 },
      );
    }

    const entry = await generateEntry(query);
    if (body.surprise) {
      entry.kind = "surprise";
      entry.query = query;
    }

    return NextResponse.json({ entry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The Guide could not respond.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
