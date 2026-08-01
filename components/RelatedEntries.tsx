"use client";

import { PlasticButton } from "@/components/PlasticButton";

type Props = {
  topics: string[];
  onSelect: (topic: string) => void;
  disabled?: boolean;
};

export function RelatedEntries({ topics, onSelect, disabled }: Props) {
  if (!topics.length) return null;

  return (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]">
        See also
      </h2>
      <ul className="space-y-2">
        {topics.map((topic) => (
          <li key={topic}>
            <PlasticButton
              variant="secondary"
              fullWidth
              disabled={disabled}
              onClick={() => onSelect(topic)}
              className="normal-case tracking-normal"
            >
              {topic}
            </PlasticButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
