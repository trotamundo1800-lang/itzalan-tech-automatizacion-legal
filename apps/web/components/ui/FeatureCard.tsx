import type { ReactNode } from 'react';

export function FeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <article className="group lex-gradient-frame p-5 shadow-[0_22px_48px_-32px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-1 hover:border-blue-500/80">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-xl border border-slate-700 bg-slate-950/80 p-2 text-cyan-300 shadow-[0_10px_24px_-18px_rgba(34,211,238,0.9)]">{icon}</span>
        {badge ? <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">{badge}</span> : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-50">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 transition group-hover:text-cyan-300">
        Flujo optimizado
      </p>
    </article>
  );
}
