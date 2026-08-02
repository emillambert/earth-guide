import type { HTMLAttributes, ReactNode } from "react";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  tone?: "warning" | "muted";
};

export function Notice({
  children,
  tone = "warning",
  role = "alert",
  className = "",
  ...rest
}: Props) {
  return (
    <div
      role={role}
      {...rest}
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
