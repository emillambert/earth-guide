import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "warning" | "muted";
  role?: "alert" | "status";
  className?: string;
};

export function Notice({
  children,
  tone = "warning",
  role = "alert",
  className = "",
}: Props) {
  return (
    <div
      role={role}
      className={[
        "border px-3 py-3 text-sm leading-relaxed",
        tone === "warning"
          ? "border-[color:var(--warning)]/50 bg-[color:var(--warning)]/5 text-[color:var(--warning)]"
          : "border-[color:var(--screen-muted)]/30 text-[color:var(--screen-muted)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
