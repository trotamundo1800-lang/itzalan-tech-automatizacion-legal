import Link from 'next/link';
import { featureModules } from '../feature-data';
import { FeatureShell } from '../feature-shell';

export default function AgendaPage() {
  return (
    <FeatureShell module={featureModules.agenda}>
      <Link href="/dashboard" className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
        Ver dashboard
      </Link>
    </FeatureShell>
  );
}