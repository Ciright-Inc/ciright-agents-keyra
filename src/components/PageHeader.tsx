import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-6 pb-6 border-b border-[color:var(--border)] mb-6">
      <div>
        {eyebrow ? <div className="h-eyebrow mb-2">{eyebrow}</div> : null}
        <h1 className="h-display">{title}</h1>
        {description ? (
          <p className="text-[13px] text-muted mt-2 max-w-[64ch]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
