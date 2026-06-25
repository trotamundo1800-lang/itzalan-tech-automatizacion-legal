import type { ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">{eyebrow}</p> : null}
        <h2 className="mt-2 font-heading text-3xl font-bold text-slate-50 sm:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-3 text-base leading-7 text-slate-300">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
