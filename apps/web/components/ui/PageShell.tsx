import type { ReactNode } from 'react';

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={cx('lex-page', className)}>
      <div className="lex-page-shell">{children}</div>
    </main>
  );
}

export function HeroPanel({
  eyebrow,
  title,
  description,
  actions,
  aside,
  className,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('lex-hero', className)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)] lg:items-start">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">{eyebrow}</p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-tight">
            {title}
          </h1>
          <div className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{description}</div>
          {actions ? <div className="flex flex-wrap gap-3 pt-2">{actions}</div> : null}
        </div>
        {aside ? <div className="rounded-[1rem] border border-slate-700 bg-slate-900/60 p-5 backdrop-blur">{aside}</div> : null}
      </div>
    </section>
  );
}

export function SurfaceCard({
  children,
  className,
  muted = false,
}: {
  children: ReactNode;
  className?: string;
  muted?: boolean;
}) {
  return <section className={cx(muted ? 'lex-card-muted' : 'lex-card', className)}>{children}</section>;
}

export function StatusBanner({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'error' | 'success';
  className?: string;
}) {
  const toneClass =
    tone === 'error'
      ? 'lex-notice-error'
      : tone === 'success'
        ? 'lex-notice-success'
        : 'rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-200';

  return <div className={cx(toneClass, className)}>{children}</div>;
}

export function LegalDocumentPage({
  eyebrow,
  title,
  subtitle,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <article className="mx-auto max-w-4xl space-y-8 rounded-[1.2rem] border border-slate-700 bg-slate-900/90 p-6 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8 lg:p-10">
        <header className="space-y-4 border-b border-slate-700 pb-6">
          <span className="lex-pill">{eyebrow}</span>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">{title}</h1>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">{subtitle}</p>
          </div>
          {meta ? <div className="space-y-1 text-sm text-slate-300">{meta}</div> : null}
        </header>
        <div className="space-y-8 text-slate-300 [&_ol]:text-slate-300 [&_p]:text-slate-300">{children}</div>
      </article>
    </PageShell>
  );
}
