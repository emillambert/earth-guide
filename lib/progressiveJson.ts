export type GuideProgress = {
  title?: string;
  opening?: string;
  paragraphs: string[];
};

function readString(source: string, start: number): string | undefined {
  if (source[start] !== '"') return undefined;

  let escaped = false;
  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\") {
      escaped = true;
      continue;
    }
    if (character === '"') {
      try {
        return JSON.parse(source.slice(start, index + 1)) as string;
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

function valueStart(source: string, key: string): number {
  const keyIndex = source.indexOf(`"${key}"`);
  if (keyIndex === -1) return -1;
  const colon = source.indexOf(":", keyIndex + key.length + 2);
  if (colon === -1) return -1;

  let index = colon + 1;
  while (index < source.length && /\s/.test(source[index] ?? "")) index += 1;
  return index;
}

function stringField(source: string, key: string): string | undefined {
  const start = valueStart(source, key);
  return start === -1 ? undefined : readString(source, start);
}

function partialStringField(
  source: string,
  key: string,
): { value: string; complete: boolean } | undefined {
  const start = valueStart(source, key);
  if (start === -1 || source[start] !== '"') return undefined;

  const complete = readString(source, start);
  if (complete !== undefined) return { value: complete, complete: true };

  const unfinished = source.slice(start);
  for (
    let trim = 0;
    trim <= Math.min(8, unfinished.length - 1);
    trim += 1
  ) {
    try {
      const candidate = `${unfinished.slice(0, unfinished.length - trim)}"`;
      return {
        value: JSON.parse(candidate) as string,
        complete: false,
      };
    } catch {
      // A streamed escape sequence may be incomplete; trim through it.
    }
  }

  return undefined;
}

/** Extract only fully closed fields from an incomplete structured JSON stream. */
export function extractGuideProgress(source: string): GuideProgress {
  const body = partialStringField(source, "body");
  const sections = body?.value
    .split(/\n\s*\n/)
    .map((section) => section.trim())
    .filter(Boolean) ?? [];

  if (body && !body.complete && !/\n\s*\n$/.test(body.value)) {
    sections.pop();
  }

  const [opening, ...paragraphs] = sections;
  return {
    title: stringField(source, "title"),
    opening,
    paragraphs,
  };
}
