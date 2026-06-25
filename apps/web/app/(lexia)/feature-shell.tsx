import Link from 'next/link';
import type { FeatureModule } from './feature-data';

type FeatureShellProps = {
  module: FeatureModule;
  children?: React.ReactNode;
};

const moduleGroups = [
  {
    title: 'Operación legal',
    links: [
      { href: '/clientes', label: 'CRM Jurídico' },
      { href: '/expedientes', label: 'Expedientes' },
      { href: '/agenda', label: 'Agenda Procesal' },
    ],
  },
  {
    title: 'Automatización',
    links: [
      { href: '/documentos', label: 'Documentos' },
      { href: '/contratos', label: 'Contratos' },
      { href: '/ia-juridica', label: 'IA Jurídica' },
      { href: '/analisis', label: 'Análisis' },
      { href: '/biblioteca', label: 'Biblioteca' },
    ],
  },
  {
    title: 'Comercial',
    links: [
      { href: '/suscripciones', label: 'Suscripciones' },
      { href: '/admin/planes', label: 'Admin Planes' },
    ],
  },
];

export function FeatureShell({ module, children }: FeatureShellProps) {
  const activeHref = `/${module.slug}`;

  return (
    <main className="lex-page p-4 text-slate-100 sm:p-6">
      <section className="mx-auto grid max-w-[1320px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lex-gradient-frame rounded-[1.25rem] p-[1px]">
          <div className="h-full rounded-[1.2rem] border border-slate-700 bg-slate-900/85 p-4 shadow-[0_22px_50px_-40px_rgba(0,0,0,0.9)]">
          <div className="rounded-xl border border-blue-700/40 bg-blue-900/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Workspace</p>
            <p className="mt-1 text-base font-semibold text-slate-50">ITZALAN TECH</p>
            <p className="mt-2 text-xs text-slate-300">Operación jurídica empresarial</p>
          </div>

          <div className="mt-5 space-y-4">
            {moduleGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{group.title}</p>
                <nav className="space-y-1">
                  {group.links.map((link) => {
                    const active = link.href === activeHref;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`lex-sidebar-link ${active ? 'lex-sidebar-link-active' : ''}`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
          </div>
        </aside>

        <section className="lex-section-surface space-y-6 rounded-[1.2rem] p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-700 pb-7">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{module.eyebrow}</p>
              <h1 className="mt-3 lex-heading-xl">{module.title}</h1>
              <p className="mt-4 text-base leading-7 text-slate-300">{module.description}</p>
            </div>

            <div className="lex-gradient-frame min-w-[280px] rounded-xl p-[1px]">
              <div className="h-full rounded-xl border border-slate-700 bg-[#111827] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Integración backend</p>
              <p className="mt-3 text-sm text-slate-300">Estado: disponible para conexión</p>
              <p className="mt-2 text-sm text-slate-300">Endpoint: {module.backend.method} {module.backend.endpoint}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {module.highlights.map((highlight) => (
              <div key={highlight.title} className="lex-gradient-frame rounded-xl p-[1px]">
                <div className="h-full rounded-xl border border-slate-700 bg-[#111827] p-5">
                <h2 className="font-semibold text-slate-50">{highlight.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>

          {children ? <div className="space-y-6">{children}</div> : null}
        </section>
      </section>
    </main>
  );
}