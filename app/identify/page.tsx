"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GuideShell } from "@/components/GuideShell";
import { GuideScreen } from "@/components/GuideScreen";
import { PlasticButton } from "@/components/PlasticButton";
import { LoadingDisplay } from "@/components/LoadingDisplay";
import { Notice } from "@/components/Notice";
import { PageNav } from "@/components/PageNav";
import { fetchIdentifyEntry } from "@/lib/apiClient";
import { cacheEntry } from "@/lib/storage";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export default function IdentifyPage() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [readingFile, setReadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setReadingFile(true);
    setError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read image.");
    } finally {
      setReadingFile(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!preview) {
      setError("Take or upload a photo first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const entry = await fetchIdentifyEntry({
        imageDataUrl: preview,
        question: question.trim() || undefined,
      });
      cacheEntry(entry);
      router.push(`/entry/${entry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identification failed.");
      setLoading(false);
    }
  }

  return (
    <GuideShell>
      <GuideScreen>
        <PageNav />
        {loading ? (
          <LoadingDisplay label="Inspecting image" />
        ) : (
          <form onSubmit={handleSubmit} className="terminal-enter space-y-5 pb-4">
            <header className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--screen-muted)]">
                Visual consultation
              </p>
              <h1 className="text-2xl font-semibold uppercase tracking-[0.06em]">
                Identify
              </h1>
              <p className="text-sm text-[color:var(--screen-muted)]">
                Photograph a thing. Ask a question if needed. Expect uncertainty.
              </p>
            </header>

            {!preview ? (
              <div className="grid grid-cols-2 gap-2">
              <PlasticButton
                type="button"
                disabled={readingFile}
                onClick={() => {
                  if (!cameraRef.current) return;
                  cameraRef.current.value = "";
                  cameraRef.current.click();
                }}
              >
                Take a photo
              </PlasticButton>
              <PlasticButton
                type="button"
                variant="secondary"
                disabled={readingFile}
                onClick={() => {
                  if (!uploadRef.current) return;
                  uploadRef.current.value = "";
                  uploadRef.current.click();
                }}
              >
                Upload a photo
              </PlasticButton>
              </div>
            ) : null}

            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Take a photo"
              className="hidden"
              onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
            />
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              aria-label="Upload a photo"
              className="hidden"
              onChange={(event) => void onFile(event.target.files?.[0] ?? null)}
            />

            {readingFile ? (
              <p
                role="status"
                className="loading-pulse text-xs uppercase tracking-[0.14em] text-[color:var(--screen-muted)]"
              >
                Reading image…
              </p>
            ) : null}

            {preview ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Selected for identification"
                  className="h-64 w-full border border-[color:var(--screen-muted)]/40 bg-[color:var(--screen-deep)]/45 object-contain"
                />
                <div className="grid grid-cols-2 gap-2">
                  <PlasticButton
                    type="button"
                    variant="secondary"
                    disabled={readingFile}
                    onClick={() => {
                      if (!uploadRef.current) return;
                      uploadRef.current.value = "";
                      uploadRef.current.click();
                    }}
                  >
                    Change photo
                  </PlasticButton>
                  <PlasticButton
                    type="button"
                    variant="secondary"
                    disabled={readingFile}
                    onClick={() => {
                      setPreview(null);
                      setError(null);
                    }}
                  >
                    Remove
                  </PlasticButton>
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center border border-dashed border-[color:var(--screen-muted)]/40 text-xs uppercase tracking-[0.14em] text-[color:var(--screen-muted)]">
                No image selected
              </div>
            )}

            <label htmlFor="identify-question" className="block space-y-2">
              <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
                Optional question
              </span>
              <input
                id="identify-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="What bird is this? Can I eat this?"
                className="lookup-field min-h-12 w-full px-3 py-3 text-base"
              />
            </label>

            <PlasticButton
              type="submit"
              fullWidth
              disabled={!preview || readingFile}
            >
              Identify
            </PlasticButton>

            {error ? (
              <Notice>{error}</Notice>
            ) : null}
          </form>
        )}
      </GuideScreen>
    </GuideShell>
  );
}
