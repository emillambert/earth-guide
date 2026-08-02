import { NextResponse } from "next/server";
import { generateEntry, generateEntryStreaming } from "@/lib/openai";
import { pickRandomTopic } from "@/lib/randomTopics";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      query?: string;
      surprise?: boolean;
      stream?: boolean;
      entryId?: string;
      local?: {
        latitude?: number;
        longitude?: number;
        placeName?: string;
      };
    };

    const local =
      typeof body.local?.latitude === "number" &&
      typeof body.local.longitude === "number" &&
      body.local.placeName?.trim()
        ? {
            latitude: body.local.latitude,
            longitude: body.local.longitude,
            placeName: body.local.placeName.trim(),
          }
        : null;
    const query = local
      ? `What should a traveller know about ${local.placeName}? The supplied coordinates are ${local.latitude}, ${local.longitude}.`
      : body.surprise
        ? pickRandomTopic()
        : body.query?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "A lookup query is required." },
        { status: 400 },
      );
    }

    if (body.stream) {
      const encoder = new TextEncoder();
      const responseStream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (event: unknown) => {
            controller.enqueue(
              encoder.encode(`${JSON.stringify(event)}\n`),
            );
          };

          try {
            send({ type: "started", query });
            const entry = await generateEntryStreaming(
              query,
              (delta) => send({ type: "delta", delta }),
              {
                id: body.entryId?.trim() || undefined,
                kind: local
                  ? "local"
                  : body.surprise
                    ? "surprise"
                    : "lookup",
                query: local?.placeName ?? query,
              },
              request.signal,
            );
            send({ type: "complete", entry });
          } catch (error) {
            if (!request.signal.aborted) {
              send({
                type: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "The Guide could not respond.",
              });
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(responseStream, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
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
