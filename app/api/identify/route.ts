import { NextResponse } from "next/server";
import { generateIdentifyEntry } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let imageDataUrl = "";
    let question: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const image = form.get("image");
      const q = form.get("question");
      if (typeof q === "string" && q.trim()) question = q.trim();

      if (!(image instanceof File)) {
        return NextResponse.json(
          { error: "An image file is required." },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await image.arrayBuffer());
      const mime = image.type || "image/jpeg";
      imageDataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    } else {
      const body = (await request.json()) as {
        imageDataUrl?: string;
        question?: string;
      };
      imageDataUrl = body.imageDataUrl || "";
      question = body.question?.trim() || undefined;
    }

    if (!imageDataUrl.startsWith("data:")) {
      return NextResponse.json(
        { error: "A valid image is required." },
        { status: 400 },
      );
    }

    // Keep payloads reasonable for serverless limits.
    if (imageDataUrl.length > 6_000_000) {
      return NextResponse.json(
        { error: "Image is too large. Try a smaller photo." },
        { status: 413 },
      );
    }

    const entry = await generateIdentifyEntry({ imageDataUrl, question });
    return NextResponse.json({ entry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Identification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
