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

function stringArrayField(source: string, key: string): string[] {
  const start = valueStart(source, key);
  if (start === -1 || source[start] !== "[") return [];

  const values: string[] = [];
  let index = start + 1;
  while (index < source.length) {
    while (
      index < source.length &&
      (/\s/.test(source[index] ?? "") || source[index] === ",")
    ) {
      index += 1;
    }
    if (source[index] === "]" || index >= source.length) break;
    if (source[index] !== '"') break;

    const value = readString(source, index);
    if (value === undefined) break;
    values.push(value);

    let escaped = false;
    index += 1;
    while (index < source.length) {
      const character = source[index];
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        index += 1;
        break;
      }
      index += 1;
    }
  }

  return values;
}

/** Extract only fully closed fields from an incomplete structured JSON stream. */
export function extractGuideProgress(source: string): GuideProgress {
  return {
    title: stringField(source, "title"),
    opening: stringField(source, "opening"),
    paragraphs: stringArrayField(source, "paragraphs"),
  };
}
