'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  BarChart3,
  Bot,
  Brain,
  Briefcase,
  CalendarDays,
  FileText,
  Gavel,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { FeatureCard, InfoBand, Modal, PricingCard, SectionHeader, StatCard } from '../components/ui';

const stats = [
  { label: 'Documentos generados', value: '+500', icon: FileText, detail: 'Plantillas legales y contratos' },
  { label: 'Expedientes gestionados', value: '+100', icon: Briefcase, detail: 'Control integral por despacho' },
  { label: 'Asistencia con IA', value: '24/7', icon: Bot, detail: 'Soporte jurídico continuo' },
  { label: 'Cobertura', value: 'HN + CA', icon: ShieldCheck, detail: 'Honduras y Centroamérica' },
];

const features = [
  {
    title: 'Generación de documentos legales',
    description: 'Automatiza contratos, cartas, dictámenes y plantillas con control de versión y trazabilidad.',
    icon: FileText,
    badge: 'Documentos',
  },
  {
    title: 'Análisis jurídico con IA',
    description: 'Obtén análisis de riesgos, estrategia y redacción asistida sobre cada caso en segundos.',
    icon: Brain,
    badge: 'IA Jurídica',
  },
  {
    title: 'Gestión integral de expedientes',
    description: 'Conecta cliente, juzgado, plazos y documentos en una sola línea de trabajo.',
    icon: Briefcase,
    badge: 'Expedientes',
  },
  {
    title: 'Agenda procesal inteligente',
    description: 'Centraliza audiencias, reuniones y vencimientos con alertas visuales priorizadas.',
    icon: CalendarDays,
    badge: 'Agenda',
  },
  {
    title: 'CRM jurídico para clientes',
    description: 'Mantén fichas completas, historial legal y seguimiento comercial de cada cliente.',
    icon: Users,
    badge: 'Clientes',
  },
  {
    title: 'Gestión de cobros y planes',
    description: 'Visualiza estado de pagos, planes activos y alertas de vencimiento de suscripciones.',
    icon: BarChart3,
    badge: 'Pagos',
  },
];

const tabs = [
  {
    id: 'abogados',
    label: 'Para abogados',
    title: 'Ejecución legal más rápida y estratégica',
    text: 'Optimiza tiempo de redacción, análisis y seguimiento procesal con una interfaz jurídica orientada a resultados.',
    image: '/images/lawyer-tech.png',
  },
  {
    id: 'firmas',
    label: 'Para firmas',
    title: 'Operación corporativa con control y trazabilidad',
    text: 'Administra equipos, expedientes y clientes con estándares SaaS modernos y visibilidad completa del flujo legal.',
    image: '/images/dashboard-preview.png',
  },
  {
    id: 'empresas',
    label: 'Para empresas',
    title: 'Gobernanza legal integrada al negocio',
    text: 'Alinea áreas legales y administrativas con automatización documental, análisis de riesgo y reportes ejecutivos.',
    image: '/images/artificial-intelligence-law.png',
  },
];

const faq = [
  {
    q: '¿ITZALAN TECH reemplaza al abogado?',
    a: 'No. ITZALAN TECH potencia la capacidad del abogado con automatización y analítica para decisiones mejor fundamentadas.',
  },
  {
    q: '¿Puedo empezar sin integrar base de datos real?',
    a: 'Sí. La plataforma cuenta con modo demo funcional para validar procesos antes de conectar persistencia productiva.',
  },
  {
    q: '¿La plataforma sirve para despachos y empresas?',
    a: 'Sí. El diseño contempla operación individual, firmas legales y departamentos jurídicos empresariales.',
  },
];

const testimonials = [
  {
    author: 'Lic. Andrea Pineda',
    role: 'Socia · Despacho Lexia',
    text: 'El flujo de expedientes y documentos se volvió más claro. El tiempo de preparación procesal bajó de forma tangible.',
  },
  {
    author: 'Dr. Mauricio Alvarado',
    role: 'Consultor Corporativo',
    text: 'La capa IA permite evaluar riesgos y preparar estrategia con más velocidad y consistencia.',
  },
  {
    author: 'Gerencia Legal Empresarial',
    role: 'Sector financiero',
    text: 'La vista ejecutiva facilita seguimiento de cartera legal y vencimientos críticos para toma de decisiones.',
  },
];

const identitySignals = [
  { label: 'Disponibilidad', value: '99.9%', hint: 'Infraestructura monitoreada' },
  { label: 'Soporte ejecutivo', value: '< 24h', hint: 'Respuesta comercial y técnica' },
  { label: 'Cumplimiento', value: 'Términos + privacidad', hint: 'Marco legal visible' },
  { label: 'Onboarding', value: 'Guiado', hint: 'Activación por etapas' },
];

const trustTags = ['Despachos boutique', 'Firmas corporativas', 'Áreas legales internas', 'Consultores especializados'];

export default function Home() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [openDemo, setOpenDemo] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(faq[0].q);

  const currentTab = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <main className="lex-page">
      <div className="lex-page-shell">
        <section className="lex-hero lex-fade-in">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="lex-pill">ITZALAN TECH · LEXIA Legal IA</span>
              <h1 className="mt-5 font-heading text-5xl font-bold leading-tight text-slate-50 sm:text-6xl">
                Automatización legal inteligente para abogados modernos
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
                ITZALAN TECH transforma la gestión legal mediante inteligencia artificial, documentos automatizados,
                expedientes digitales y agenda procesal.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/registro" className="lex-button-primary">
                  Comenzar ahora
                </Link>
                <button type="button" className="lex-button-secondary" onClick={() => setOpenDemo(true)}>
                  Ver demostración
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 p-2">
              <Image
                src="/images/legal-ai-hero.jpg"
                alt="Tecnología legal con inteligencia artificial"
                width={920}
                height={720}
                className="h-[22rem] w-full rounded-xl object-cover"
                priority
              />
              <div className="absolute inset-x-4 bottom-4 rounded-xl border border-slate-600/80 bg-slate-950/80 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Suite legal inteligente</p>
                <p className="mt-1 text-sm text-slate-200">Asistente IA + expedientes + documentos + agenda en una plataforma unificada.</p>
              </div>
            </div>
          </div>
        </section>

        <InfoBand items={identitySignals} />

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <SectionHeader
            eyebrow="Confianza"
            title="Diseñado para operación legal profesional"
            subtitle="Una identidad visual corporativa consistente para presentaciones comerciales, demos y uso diario del despacho."
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {trustTags.map((tag) => (
              <span key={tag} className="lex-trust-chip">
                {tag}
              </span>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              icon={<stat.icon className="h-5 w-5" />}
            />
          ))}
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="Servicios"
            title="Módulos diseñados para operación legal corporativa"
            subtitle="Un ecosistema completo para despachos, abogados y equipos legales empresariales."
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                badge={feature.badge}
                icon={<feature.icon className="h-5 w-5" />}
              />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="Cómo funciona"
            title="Implementación progresiva para abogados y empresas"
            subtitle="Selecciona tu perfil para visualizar el enfoque operativo recomendado."
          />

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-amber-300/70 bg-amber-400/10 text-amber-200'
                    : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <article className="grid gap-5 rounded-2xl border border-slate-700 bg-slate-900/75 p-5 md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h3 className="font-heading text-3xl font-bold text-slate-50">{currentTab.title}</h3>
              <p className="mt-3 text-slate-300">{currentTab.text}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2"><Scale className="h-4 w-4 text-cyan-300" /> Diagnóstico inicial y activación</li>
                <li className="flex items-center gap-2"><Gavel className="h-4 w-4 text-cyan-300" /> Parametrización legal por tipo de caso</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> Capacitación de equipo y despliegue</li>
              </ul>
            </div>
            <Image
              src={currentTab.image}
              alt={currentTab.title}
              width={720}
              height={460}
              className="h-64 w-full rounded-xl border border-slate-700 object-cover"
            />
          </article>
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="Planes"
            title="Escalabilidad por etapa de crecimiento"
            subtitle="Elige el plan que mejor se ajusta a tu práctica legal o estructura corporativa."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <PricingCard
              name="Básico"
              price="L 800/mes"
              description="Ideal para abogados independientes"
              features={['Clientes y expedientes', 'Plantillas esenciales', 'Soporte estándar']}
            />
            <PricingCard
              name="Profesional"
              price="L 1,500/mes"
              description="Para despachos con operación continua"
              features={['Todo en Básico', 'IA jurídica avanzada', 'Automatización de agenda y alertas']}
              highlighted
            />
            <PricingCard
              name="Corporativo"
              price="L 3,500/mes"
              description="Enfoque empresarial y multiusuario"
              features={['Todo en Profesional', 'Gestión avanzada de pagos', 'Soporte prioritario empresarial']}
            />
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="Testimonios"
            title="Percepción de valor en entorno legal real"
            subtitle="Referencias demo de uso por abogados y organizaciones en Centroamérica."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.author} className="rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
                <p className="text-sm leading-7 text-slate-200">“{testimonial.text}”</p>
                <div className="mt-4 border-t border-slate-700 pt-3">
                  <p className="text-sm font-semibold text-slate-50">{testimonial.author}</p>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-gradient-to-r from-[#12264a] via-[#132e56] to-[#0f1b34] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Llamado a la acción</p>
              <h3 className="mt-2 font-heading text-4xl font-bold text-slate-50">Presenta una operación legal de nivel premium</h3>
              <p className="mt-2 max-w-2xl text-slate-200">Activa tu entorno ITZALAN TECH y muestra una plataforma lista para clientes, socios e inversionistas.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/registro" className="lex-button-primary">Crear cuenta</Link>
              <Link href="/contacto" className="lex-button-secondary">Agendar demo</Link>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-5">
          <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes" />
          {faq.map((item) => {
            const open = openFaq === item.q;
            return (
              <article key={item.q} className="rounded-xl border border-slate-700 bg-slate-950/50">
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : item.q)}
                  className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-100"
                >
                  {item.q}
                </button>
                {open ? <p className="border-t border-slate-700 px-4 py-3 text-sm text-slate-300">{item.a}</p> : null}
              </article>
            );
          })}
        </section>

        <Modal open={openDemo} title="Demostración de ITZALAN TECH" onClose={() => setOpenDemo(false)}>
          <div className="space-y-3 text-sm text-slate-300">
            <p>
              La demo muestra flujo completo de clientes, expedientes, documentos e IA jurídica en una interfaz
              corporativa orientada a productividad.
            </p>
            <Image
              src="/images/documents-automation.png"
              alt="Vista demo de automatización documental"
              width={760}
              height={420}
              className="h-52 w-full rounded-xl border border-slate-700 object-cover"
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="lex-button-secondary" onClick={() => setOpenDemo(false)}>
                Cerrar
              </button>
              <Link href="/contacto" className="lex-button-primary" onClick={() => setOpenDemo(false)}>
                Solicitar presentación
              </Link>
            </div>
          </div>
        </Modal>
      </div>
    </main>
  );
}
