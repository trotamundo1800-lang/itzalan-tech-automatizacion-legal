import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
}>;

export function Card({ title, subtitle, eyebrow, className = '', children }: CardProps) {
  return (
    <section className={`lex-card ${className}`.trim()}>
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300">{eyebrow}</p> : null}
      {title ? <h2 className="mt-1 text-2xl font-semibold text-slate-50">{title}</h2> : null}
      {subtitle ? <p className="mt-1 text-sm leading-7 text-slate-400">{subtitle}</p> : null}
      <div className={title || subtitle ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}
