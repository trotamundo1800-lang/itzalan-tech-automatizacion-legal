import Link from 'next/link';
import { BadgeDollarSign, CheckCircle2, ShieldCheck } from 'lucide-react';
import { HeroPanel, InfoBand, PageShell, PricingCard, SectionHeader } from '../../components/ui';

const planes = [
  {
    nombre: 'Básico',
    precio: 'L 800/mes',
    descripcion: 'Operación esencial para abogado independiente.',
    features: ['Clientes y expedientes', 'Documentos esenciales', 'Soporte estándar'],
  },
  {
    nombre: 'Profesional',
    precio: 'L 1,500/mes',
    descripcion: 'Para despachos con mayor volumen y automatización.',
    features: ['Todo en Básico', 'IA jurídica avanzada', 'Agenda y alertas automáticas'],
  },
  {
    nombre: 'Corporativo',
    precio: 'L 3,500/mes',
    descripcion: 'Escala empresarial con control multiusuario.',
    features: ['Todo en Profesional', 'Control multiusuario', 'Soporte prioritario ejecutivo'],
  },
];

const commercialSignals = [
  { label: 'Activación', value: '< 24h', hint: 'Onboarding comercial guiado' },
  { label: 'Cobertura', value: 'HN + CA', hint: 'Escalabilidad regional' },
  { label: 'Planes', value: '3 niveles', hint: 'Crecimiento progresivo' },
  { label: 'Confianza', value: 'Soporte legal', hint: 'Acompañamiento especializado' },
];

export default function PlanesPage() {
  return (
    <PageShell>
      <HeroPanel
        eyebrow="Planes y suscripciones"
        title="Escala tu operación legal con un plan alineado a tu etapa"
        description={
          <>
            <p>Comparativa clara, enfoque comercial y estructura pensada para presentar valor frente a socios y clientes.</p>
            <p>Empieza en básico y evoluciona hacia un stack jurídico corporativo completo.</p>
          </>
        }
        actions={
          <>
            <Link href="/registro" className="lex-button-primary">Comenzar ahora</Link>
            <Link href="/contacto" className="lex-button-secondary">Solicitar asesoría</Link>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-200">
            <p className="font-semibold text-white">Beneficio comercial</p>
            <p className="text-slate-300">Cada plan está diseñado para aumentar eficiencia y percepción premium del despacho.</p>
          </div>
        }
      />

      <InfoBand items={commercialSignals} />

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Comparativa"
          title="Elige el plan óptimo para tu práctica"
          subtitle="Tarifas claras, beneficios concretos y una ruta de crecimiento alineada al negocio legal."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {planes.map((plan) => (
            <PricingCard
              key={plan.nombre}
              name={plan.nombre}
              price={plan.precio}
              description={plan.descripcion}
              features={plan.features}
              highlighted={plan.nombre === 'Profesional'}
              actionLabel={plan.nombre === 'Profesional' ? 'Elegir recomendado' : 'Elegir plan'}
              footer={
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Soporte y activación incluidos
                </span>
              }
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
        <SectionHeader eyebrow="Garantía" title="Transparencia comercial y seguridad operativa" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-slate-700 bg-slate-950/55 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2 font-semibold text-slate-100"><BadgeDollarSign className="h-4 w-4 text-amber-300" /> Precios claros</p>
            <p className="mt-2">Sin costos ocultos para operación estándar.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-950/55 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2 font-semibold text-slate-100"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Escalable</p>
            <p className="mt-2">Sube de plan sin migraciones complejas.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-950/55 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2 font-semibold text-slate-100"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Soporte premium</p>
            <p className="mt-2">Acompañamiento en implementación y despliegue.</p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
