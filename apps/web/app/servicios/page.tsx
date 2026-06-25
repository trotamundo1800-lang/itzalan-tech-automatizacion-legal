import Link from 'next/link';
import { Bot, Briefcase, CalendarClock, FileText, Gauge, Users } from 'lucide-react';
import { FeatureCard, HeroPanel, PageShell, SectionHeader, SurfaceCard } from '../../components/ui';

const servicios = [
  {
    title: 'Generación de documentos legales',
    description: 'Plantillas premium para contratos, demandas, cartas y escritos con control de consistencia.',
    icon: FileText,
    badge: 'Documentos',
  },
  {
    title: 'Análisis jurídico con IA',
    description: 'Asistente con enfoque legal para riesgos, estrategia procesal y redacción asistida.',
    icon: Bot,
    badge: 'IA Jurídica',
  },
  {
    title: 'Gestión integral de expedientes',
    description: 'Seguimiento de estados, hitos, plazos y contexto por cliente en una sola vista.',
    icon: Briefcase,
    badge: 'Expedientes',
  },
  {
    title: 'Agenda procesal inteligente',
    description: 'Audiencias, vencimientos y tareas con prioridad visual para ejecución oportuna.',
    icon: CalendarClock,
    badge: 'Agenda',
  },
  {
    title: 'CRM jurídico empresarial',
    description: 'Control comercial-jurídico de clientes, historial de casos y estado de atención.',
    icon: Users,
    badge: 'Clientes',
  },
  {
    title: 'Métricas y decisiones',
    description: 'Panel ejecutivo con indicadores clave para socios, directores y equipos operativos.',
    icon: Gauge,
    badge: 'Analytics',
  },
];

export default function ServiciosPage() {
  return (
    <PageShell>
      <HeroPanel
        eyebrow="Servicios ITZALAN TECH"
        title="Suite legaltech de nivel corporativo para despachos modernos"
        description={
          <>
            <p>Unifica operación jurídica, automatización documental e inteligencia legal en una experiencia SaaS premium.</p>
            <p>Diseñada para abogados independientes, firmas y áreas legales empresariales en crecimiento.</p>
          </>
        }
        actions={
          <>
            <Link href="/registro" className="lex-button-primary">Activar prueba</Link>
            <Link href="/contacto" className="lex-button-secondary">Hablar con un consultor</Link>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-200">
            <p className="font-semibold text-white">Resultados esperados</p>
            <p className="text-slate-300">Menos fricción operativa, mayor trazabilidad y mejor percepción profesional frente a clientes.</p>
          </div>
        }
      />

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Módulos"
          title="Servicios integrados para productividad legal"
          subtitle="Cada módulo está pensado para conectarse con el resto y sostener una operación legal escalable."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servicios.map((servicio) => (
            <FeatureCard
              key={servicio.title}
              title={servicio.title}
              description={servicio.description}
              badge={servicio.badge}
              icon={<servicio.icon className="h-5 w-5" />}
            />
          ))}
        </div>
      </section>

      <SurfaceCard className="lex-gradient-frame p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Cierre comercial</p>
            <h2 className="mt-2 lex-heading-md">Presenta una propuesta legal moderna y diferencial</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Integra documentos, expedientes, agenda e IA jurídica en un solo flujo listo para demos, pilotos y operación diaria.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/planes" className="lex-button-primary">Ver planes</Link>
            <Link href="/ia-juridica" className="lex-button-secondary">Ver IA jurídica</Link>
          </div>
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
