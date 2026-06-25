import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
  actionLabel,
  footer,
}: {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  actionLabel?: string;
  footer?: ReactNode;
}) {
  return (
    <article
      className={`relative rounded-2xl border p-6 shadow-[0_24px_58px_-36px_rgba(0,0,0,0.92)] transition duration-300 hover:-translate-y-1 ${
        highlighted
          ? 'border-amber-400/60 bg-gradient-to-b from-[#182f58] via-[#102141] to-[#0d1528]'
          : 'border-slate-700/80 bg-gradient-to-b from-slate-900/95 to-slate-950/80'
      }`}
    >
      {highlighted ? (
        <span className="absolute -top-3 right-4 rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
          Recomendado
        </span>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{name}</p>
      <p className="mt-3 font-heading text-4xl font-bold text-slate-50">{price}</p>
      <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
      <ul className="mt-5 space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button className="mt-6 w-full" variant={highlighted ? 'primary' : 'secondary'}>
        {actionLabel ?? 'Seleccionar plan'}
      </Button>
      {footer ? <div className="mt-3 text-xs text-slate-400">{footer}</div> : null}
    </article>
  );
}
