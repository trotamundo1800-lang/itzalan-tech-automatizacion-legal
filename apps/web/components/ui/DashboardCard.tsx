import type { PropsWithChildren } from 'react';

export function DashboardCard({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <article className={`lex-kpi-card ${className}`.trim()}>{children}</article>;
}
