import type { ReactNode } from 'react';

type InfoItem = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
};

export function InfoBand({ items }: { items: InfoItem[] }) {
  return (
    <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.9)]">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-700 bg-slate-950/55 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
              {item.icon ? <span className="text-cyan-300">{item.icon}</span> : null}
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-50">{item.value}</p>
            {item.hint ? <p className="mt-0.5 text-xs text-slate-400">{item.hint}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}