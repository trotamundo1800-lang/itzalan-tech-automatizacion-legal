import Link from 'next/link';
import { ApiHealth } from './components/api-health';

const features = [
  {
    title: 'Generar contrato',
    href: '/contratos',
    description: 'Crea borradores legales con flujos asistidos para contratos y documentos clave.',
    eyebrow: 'Documentos',
  },
  {
    title: 'Agenda procesal',
    href: '/agenda',
    description: 'Organiza audiencias, vencimientos y recordatorios operativos desde un solo lugar.',
    eyebrow: 'Seguimiento',
  },
  {
    title: 'Análisis jurídico',
    href: '/analisis',
    description: 'Centraliza criterios, resúmenes y apoyo analitico para la revision de expedientes.',
    eyebrow: 'Inteligencia legal',
  },
  {
    title: 'Documentos',
    href: '/documentos',
    description: 'Administra documentos legales y genera Word/PDF vinculados a clientes y expedientes.',
    eyebrow: 'Automatización',
  },
  {
    title: 'IA Jurídica',
    href: '/ia-juridica',
    description: 'Analiza documentos, genera borradores y resume expedientes con soporte de IA.',
    eyebrow: 'Asistente legal',
  },
  {
    title: 'Suscripciones',
    href: '/suscripciones',
    description: 'Elige entre Plan Básico, Profesional o Empresarial y activa tu pago.',
    eyebrow: 'Comercial',
  },
  {
    title: 'Admin Planes',
    href: '/admin/planes',
    description: 'Panel de administración para precios, estado de planes y suscripciones.',
    eyebrow: 'Backoffice',
  },
  {
    title: 'Clientes',
    href: '/clientes',
    description: 'Crea, edita y administra clientes con datos de contacto y estado de atención.',
    eyebrow: 'CRM legal',
  },
  {
    title: 'Expedientes',
    href: '/expedientes',
    description: 'Gestiona expedientes vinculados a cliente con estado procesal y actualización operativa.',
    eyebrow: 'Operación',
  },
];

const metrics = [
  { label: 'Expedientes activos', value: '124' },
  { label: 'Alertas procesales', value: '18' },
  { label: 'Documentos generados', value: '1.2k' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#e2e8f0_55%,_#cbd5e1)] px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="grid gap-10 px-8 py-10 lg:grid-cols-[1.4fr_0.8fr] lg:px-12 lg:py-14">
            <div className="max-w-3xl space-y-5">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-300">LEXIA / Itzalan Tech</p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Plataforma legal con acceso, análisis y operación procesal en una sola capa.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Centraliza autenticación, automatización documental, agenda judicial y apoyo analítico para equipos
                jurídicos modernos.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-400 hover:bg-slate-900"
                >
                  Crear cuenta
                </Link>
                <ApiHealth />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-800 bg-slate-900/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Vista ejecutiva</p>
              <div className="mt-6 space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <p className="text-sm text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-[1.75rem] bg-white p-7 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <article>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{feature.eyebrow}</p>
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
                <p className="mt-6 text-sm font-semibold text-slate-900 transition group-hover:text-slate-700">
                  Abrir modulo
                </p>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
