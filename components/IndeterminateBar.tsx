export function IndeterminateBar() {
  return (
    <div
      className="h-1 w-full overflow-hidden bg-[color:var(--screen-deep)]"
      aria-hidden="true"
    >
      <div className="guide-progress-indeterminate h-full bg-[color:var(--highlight)]" />
    </div>
  );
}
