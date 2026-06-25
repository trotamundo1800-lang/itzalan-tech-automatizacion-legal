'use client';

import { CalendarDays, Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Input, SectionHeader, Select } from '../../../components/ui';
import { createAgendaEvent, getAgendaEvents, getClients, getExpedientes, toggleAgendaEvent } from '../../../lib/demoData';
import type { AgendaEventType } from '../../../types';

const tipos: AgendaEventType[] = ['audiencia', 'reunion', 'vencimiento', 'tarea', 'seguimiento'];

export default function DashboardAgendaPage() {
  const [clientes, setClientes] = useState<Awaited<ReturnType<typeof getClients>>>([]);
  const [expedientes, setExpedientes] = useState<Awaited<ReturnType<typeof getExpedientes>>>([]);
  const [eventos, setEventos] = useState<Awaited<ReturnType<typeof getAgendaEvents>>>([]);
  const [form, setForm] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    tipoEvento: 'audiencia' as AgendaEventType,
    clienteId: '',
    expedienteId: '',
    estado: 'pendiente' as const,
  });

  useEffect(() => {
    void (async () => {
      const [loadedClients, loadedExpedientes, loadedEvents] = await Promise.all([getClients(), getExpedientes(), getAgendaEvents()]);
      setClientes(loadedClients);
      setExpedientes(loadedExpedientes);
      setEventos(loadedEvents);
    })();
  }, []);

  async function refresh() {
    setEventos(await getAgendaEvents());
  }

  return (
    <>
      <Card title="Agenda procesal" subtitle="Audiencias, reuniones, vencimientos, tareas y seguimientos">
        <SectionHeader title="Registrar evento" subtitle="Calendario procesal con alertas" />
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              await createAgendaEvent({
                ...form,
                clienteId: form.clienteId || undefined,
                expedienteId: form.expedienteId || undefined,
              });
              await refresh();
              setForm({
                titulo: '',
                fecha: '',
                hora: '',
                tipoEvento: 'audiencia',
                clienteId: '',
                expedienteId: '',
                estado: 'pendiente',
              });
            })();
          }}
        >
          <Input className="mt-0" placeholder="Título" value={form.titulo} onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))} required />
          <Select className="mt-0" value={form.tipoEvento} onChange={(e) => setForm((s) => ({ ...s, tipoEvento: e.target.value as AgendaEventType }))}>
            {tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </Select>
          <Input type="date" className="mt-0" value={form.fecha} onChange={(e) => setForm((s) => ({ ...s, fecha: e.target.value }))} required />
          <Input type="time" className="mt-0" value={form.hora} onChange={(e) => setForm((s) => ({ ...s, hora: e.target.value }))} required />
          <Select className="mt-0" value={form.clienteId} onChange={(e) => setForm((s) => ({ ...s, clienteId: e.target.value }))}>
            <option value="">Sin cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombreCompleto}
              </option>
            ))}
          </Select>
          <Select className="mt-0" value={form.expedienteId} onChange={(e) => setForm((s) => ({ ...s, expedienteId: e.target.value }))}>
            <option value="">Sin expediente</option>
            {expedientes.map((expediente) => (
              <option key={expediente.id} value={expediente.id}>
                {expediente.numeroInterno}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2">
            <Button type="submit">Registrar evento</Button>
          </div>
        </form>
      </Card>

      <Card title="Próximos eventos (tarjetas)">
        <div className="grid gap-3 md:grid-cols-2">
          {eventos.slice(0, 6).map((evento) => (
            <article key={evento.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <p className="text-sm font-semibold text-slate-100">{evento.titulo}</p>
              <p className="mt-1 text-xs text-slate-400">
                {evento.fecha} · {evento.hora} · {evento.tipoEvento}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-300" />
                <Clock3 className="h-4 w-4 text-cyan-300" />
                <Badge tone={evento.estado === 'pendiente' ? 'warning' : 'success'}>{evento.estado}</Badge>
              </div>
              <Button
                className="mt-3"
                variant={evento.estado === 'pendiente' ? 'secondary' : 'ghost'}
                onClick={() => {
                  void (async () => {
                    await toggleAgendaEvent(evento.id);
                    await refresh();
                  })();
                }}
              >
                Marcar {evento.estado === 'pendiente' ? 'completado' : 'pendiente'}
              </Button>
            </article>
          ))}
        </div>
      </Card>

      <Card title="Vista en lista">
        <div className="lex-table">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Tipo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => (
                <tr key={evento.id}>
                  <td>{evento.titulo}</td>
                  <td>{evento.fecha}</td>
                  <td>{evento.hora}</td>
                  <td>{evento.tipoEvento}</td>
                  <td><Badge tone={evento.estado === 'pendiente' ? 'warning' : 'success'}>{evento.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
