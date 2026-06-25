import type { ReactNode } from 'react';

export function StatCard({
  label,
  value,
  icon,
  detail,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  detail?: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/75 p-5 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.85)] transition duration-300 hover:-translate-y-0.5 hover:border-blue-700/60 hover:shadow-[0_25px_55px_-30px_rgba(30,58,138,0.55)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-300 opacity-80" />
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">{value}</p>
          {detail ? <p className="mt-1 text-xs text-slate-400">{detail}</p> : null}
        </div>
        {icon ? <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-2 text-blue-300">{icon}</div> : null}
      </div>
    </article>
  );
}
