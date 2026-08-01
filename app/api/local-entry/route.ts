import { NextResponse } from "next/server";
import { generateLocalEntry } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      placeName?: string;
    };

    if (
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number" ||
      !body.placeName?.trim()
    ) {
      return NextResponse.json(
        { error: "latitude, longitude and placeName are required." },
        { status: 400 },
      );
    }

    const entry = await generateLocalEntry({
      latitude: body.latitude,
      longitude: body.longitude,
      placeName: body.placeName.trim(),
    });

    return NextResponse.json({ entry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Local entry failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
