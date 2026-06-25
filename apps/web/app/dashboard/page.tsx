'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BellRing, Bot, CalendarClock, FilePlus2, Scale, TriangleAlert } from 'lucide-react';
import { Badge, Card, InfoBand, StatCard } from '../../components/ui';
import { getAgendaEvents, getClients, getDashboardSnapshot, getExpedientes } from '../../lib/demoData';

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof getDashboardSnapshot>> | null>(null);
  const [expedientes, setExpedientes] = useState<Awaited<ReturnType<typeof getExpedientes>>>([]);
  const [clients, setClients] = useState<Awaited<ReturnType<typeof getClients>>>([]);
  const [agenda, setAgenda] = useState<Awaited<ReturnType<typeof getAgendaEvents>>>([]);

  useEffect(() => {
    void (async () => {
      const [loadedSnapshot, loadedExpedientes, loadedClients, loadedAgenda] = await Promise.all([
        getDashboardSnapshot(),
        getExpedientes(),
        getClients(),
        getAgendaEvents(),
      ]);
      setSnapshot(loadedSnapshot);
      setExpedientes(loadedExpedientes);
      setClients(loadedClients);
      setAgenda(loadedAgenda);
    })();
  }, []);

  if (!snapshot) {
    return <div className="space-y-6 text-slate-300">Cargando panel ejecutivo...</div>;
  }

  const getClientName = (clientId: string) => clients.find((client) => client.id === clientId)?.nombreCompleto ?? 'Sin asignar';

  const cards = [
    { label: 'Clientes activos', value: String(snapshot.clientesRegistrados), icon: <Scale className="h-5 w-5" /> },
    { label: 'Expedientes abiertos', value: String(snapshot.expedientesActivos), icon: <CalendarClock className="h-5 w-5" /> },
    { label: 'Documentos generados', value: String(snapshot.documentosGenerados), icon: <FilePlus2 className="h-5 w-5" /> },
    { label: 'Audiencias próximas', value: String(snapshot.audienciasProximas), icon: <BellRing className="h-5 w-5" /> },
    { label: 'Consultas IA', value: String(snapshot.consultasIaRealizadas), icon: <Bot className="h-5 w-5" /> },
    { label: 'Pagos pendientes', value: String(snapshot.pagosPendientes), icon: <TriangleAlert className="h-5 w-5" /> },
  ];

  const executiveBand = [
    { label: 'Pipeline legal', value: `${snapshot.expedientesActivos} casos`, hint: 'Seguimiento activo' },
    { label: 'Cartera clientes', value: `${snapshot.clientesRegistrados}`, hint: 'Contactos operativos' },
    { label: 'Producción', value: `${snapshot.documentosGenerados} docs`, hint: 'Generación acumulada' },
    { label: 'IA aplicada', value: `${snapshot.consultasIaRealizadas}`, hint: 'Consultas procesadas' },
  ];

  return (
    <div className="space-y-6">
      <section className="lex-gradient-frame p-6 sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="lex-pill">Panel ejecutivo</span>
            <h1 className="mt-4 lex-heading-xl">Centro de control LegalTech</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Vista operativa en tiempo real para clientes, expedientes, documentos, agenda y análisis jurídico con IA.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/dashboard/documentos" className="lex-button-primary">Crear documento</Link>
              <Link href="/dashboard/ia" className="lex-button-secondary">Analizar con IA</Link>
            </div>
          </div>

          <article className="rounded-2xl border border-slate-700 bg-slate-950/60 p-3 shadow-[0_20px_45px_-32px_rgba(0,0,0,0.92)]">
            <Image
              src="/brand/itzalan-logo.svg"
              alt="Vista corporativa ITZALAN TECH"
              width={980}
              height={260}
              className="h-40 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 object-contain"
              priority
            />
            <p className="mt-2 text-xs text-slate-400">
              Resumen ejecutivo visual para presentar el estado operativo del despacho a socios y clientes corporativos.
            </p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">Indicadores estratégicos</p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Actualización continua</p>
        </div>
        <div className="mt-3">
          <InfoBand items={executiveBand} />
        </div>
      </section>

      {snapshot.alertas.length > 0 ? (
        <section className="space-y-3">
          {snapshot.alertas.map((alerta) => (
            <div key={alerta} className="lex-notice-error flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" />
              <span>{alerta}</span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} detail="Actualizado hoy" />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card eyebrow="Analítica" title="Productividad semanal" subtitle="Simulación de carga operativa y rendimiento del despacho">
          <div className="mt-6 grid grid-cols-6 gap-2">
            {[54, 72, 68, 81, 75, 90].map((height, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="h-44 w-full rounded-xl border border-slate-700 bg-slate-950/70 p-2">
                  <div
                    className="h-full w-full rounded-lg bg-gradient-to-t from-blue-700 via-cyan-500 to-amber-300"
                    style={{ clipPath: `inset(${100 - height}% 0 0 0)` }}
                  />
                </div>
                <span className="text-xs text-slate-400">S{index + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card eyebrow="Agenda" title="Próximos eventos" subtitle="Agenda prioritaria">
          <div className="mt-4 space-y-3">
            {agenda.map((event) => (
              <article key={event.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-100">{event.titulo}</p>
                  <Badge tone={event.estado === 'pendiente' ? 'warning' : 'success'}>{event.estado}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {event.fecha} · {event.hora} · {event.tipoEvento}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            <Link href="/dashboard/agenda" className="lex-button-secondary text-center">Abrir agenda completa</Link>
            <Link href="/dashboard/expedientes" className="lex-button-secondary text-center">Ver expedientes</Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card eyebrow="Seguimiento" title="Expedientes recientes" subtitle="Seguimiento de estado y próximas actuaciones">
          <div className="mt-4 lex-table">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Caso</th>
                  <th>Estado</th>
                  <th>Audiencia</th>
                </tr>
              </thead>
              <tbody>
                {expedientes.map((expediente) => (
                  <tr key={expediente.id}>
                    <td>{expediente.numeroInterno}</td>
                    <td>{getClientName(expediente.clienteId)}</td>
                    <td>{expediente.tipoCaso}</td>
                    <td>
                      <Badge
                        tone={
                          expediente.estado === 'abierto'
                            ? 'success'
                            : expediente.estado === 'en-curso'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {expediente.estado}
                      </Badge>
                    </td>
                    <td>{expediente.proximaAudiencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card eyebrow="Riesgo" title="Alertas de vencimiento" subtitle="Atención inmediata">
          <div className="mt-4 space-y-3">
            <article className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              Pago corporativo con estado vencido.
            </article>
            <article className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              2 audiencias en las próximas 72 horas.
            </article>
            <article className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-3 text-sm text-cyan-100">
              3 expedientes requieren actualización de notas.
            </article>
          </div>
        </Card>
      </section>
    </div>
  );
}
