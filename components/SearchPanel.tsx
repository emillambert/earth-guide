"use client";

import { useRef, useState, type FormEvent } from "react";
import { PlasticButton } from "@/components/PlasticButton";

type Props = {
  onSubmit: (query: string) => void;
  disabled?: boolean;
  initialValue?: string;
};

export function SearchPanel({
  onSubmit,
  disabled,
  initialValue = "",
}: Props) {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label
        htmlFor="guide-query"
        className="block text-xs uppercase tracking-[0.18em] text-[color:var(--screen-muted)]"
      >
        Subject or question
      </label>
      <div className="relative">
        <input
          id="guide-query"
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="Leafcutter ants / Why tipping?"
          className="lookup-field w-full min-h-12 px-3 py-3 text-base text-[color:var(--screen-text)] placeholder:text-[color:var(--screen-muted)]"
          autoComplete="off"
          enterKeyHint="search"
        />
        {!query && !focused ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 cursor-blink text-sm text-[color:var(--screen-muted)]" />
        ) : null}
      </div>
      <PlasticButton type="submit" fullWidth disabled={disabled || !query.trim()}>
        Consult
      </PlasticButton>
    </form>
  );
}
