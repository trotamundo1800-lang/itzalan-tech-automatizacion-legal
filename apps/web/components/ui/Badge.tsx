import type { PropsWithChildren } from 'react';

type BadgeTone = 'success' | 'warning' | 'danger' | 'neutral';

type BadgeProps = PropsWithChildren<{
  tone?: BadgeTone;
  className?: string;
}>;

export function Badge({ tone = 'neutral', className = '', children }: BadgeProps) {
  const toneClass =
    tone === 'success'
      ? 'lex-badge-success'
      : tone === 'warning'
        ? 'lex-badge-warning'
        : tone === 'danger'
          ? 'lex-badge-danger'
          : 'lex-badge-neutral';

  return <span className={`${toneClass} ${className}`.trim()}>{children}</span>;
}
