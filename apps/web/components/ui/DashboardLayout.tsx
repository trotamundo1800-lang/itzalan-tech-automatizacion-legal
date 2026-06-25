import type { ReactNode } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <main className="lex-page">
      <div className="mx-auto grid max-w-[90rem] gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
        <DashboardSidebar />
        <section className="space-y-6">
          <DashboardHeader />
          <div className="lex-section-surface">{children}</div>
        </section>
      </div>
    </main>
  );
}
