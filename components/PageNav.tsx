import Link from "next/link";

type Props = {
  saved?: boolean;
};

const linkClass =
  "inline-flex min-h-11 items-center px-2 text-xs uppercase tracking-[0.12em] text-[color:var(--screen-muted)] underline-offset-4 hover:text-[color:var(--screen-text)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--highlight)]";

export function PageNav({ saved = false }: Props) {
  return (
    <nav
      aria-label="Page navigation"
      className="mb-4 flex min-h-11 items-center justify-between border-b border-[color:var(--screen-muted)]/25"
    >
      <Link href="/guide" className={linkClass}>
        ← Index
      </Link>
      {saved ? (
        <Link href="/saved" className={linkClass}>
          Saved
        </Link>
      ) : null}
    </nav>
  );
}
