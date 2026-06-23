import Link from 'next/link';
import type { FeatureModule } from './feature-data';

type FeatureShellProps = {
  module: FeatureModule;
  children?: React.ReactNode;
};

export function FeatureShell({ module, children }: FeatureShellProps) {
  const backendStatusLabel =
    module.backend.status === 'connected' ? 'conectado' : 'pendiente de conexión';

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <section className="mx-auto max-w-5xl rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{module.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight">{module.title}</h1>
            <p className="mt-4 text-lg leading-7 text-slate-600">{module.description}</p>
          </div>

          <div className="min-w-[260px] rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Integración backend</p>
            <p className="mt-3 text-sm text-slate-300">Estado: {backendStatusLabel}</p>
            <p className="mt-2 text-sm text-slate-300">Endpoint: {module.backend.method} {module.backend.endpoint}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {module.highlights.map((highlight) => (
            <div key={highlight.title} className="rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <h2 className="font-semibold text-slate-900">{highlight.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{highlight.description}</p>
            </div>
          ))}
        </div>

        {children ? <div className="mt-8">{children}</div> : null}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/login" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
            Crear cuenta
          </Link>
        </div>
      </section>
    </main>
  );
}