import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  caption?: string;
  tone?: "default" | "warning" | "critical" | "positive" | "sovereign";
}) {
  const toneClass =
    tone === "warning"
      ? "text-[color:var(--warning)]"
      : tone === "critical"
        ? "text-[color:var(--critical)]"
        : tone === "positive"
          ? "text-[color:var(--positive)]"
          : tone === "sovereign"
            ? "text-[color:var(--sovereign)]"
            : "";

  return (
    <div className="card p-4">
      <div className="h-eyebrow">{label}</div>
      <div className={`mt-1.5 text-[28px] font-semibold tracking-tight leading-none ${toneClass}`}>
        {value}
      </div>
      {caption ? <div className="text-[11px] text-muted mt-2">{caption}</div> : null}
    </div>
  );
}
