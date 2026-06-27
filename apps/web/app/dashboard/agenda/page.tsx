'use client';

import { CalendarDays, Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Input, SectionHeader, Select } from '../../../components/ui';
import { apiFetch, getAuthHeaders as getSessionAuthHeaders } from '../../lib/api';
import type { AgendaEventType } from '../../../types';

const tipos: AgendaEventType[] = ['audiencia', 'reunion', 'vencimiento', 'tarea', 'seguimiento'];

type ClientOption = { id: string; nombre: string };
type ExpedienteOption = { id: string; numeroInterno: string };
type AgendaEventItem = {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  tipoEvento: AgendaEventType;
  clienteId: string | null;
  expedienteId: string | null;
  estado: 'pendiente' | 'completado';
};

export default function DashboardAgendaPage() {
  const [clientes, setClientes] = useState<ClientOption[]>([]);
  const [expedientes, setExpedientes] = useState<ExpedienteOption[]>([]);
  const [eventos, setEventos] = useState<AgendaEventItem[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    tipoEvento: 'audiencia' as AgendaEventType,
    clienteId: '',
    expedienteId: '',
    estado: 'pendiente' as const,
  });

  async function getAuthHeaders() {
    return getSessionAuthHeaders();
  }

  useEffect(() => {
    void (async () => {
      try {
        const [clientsResponse, expedientesResponse, eventsResponse] = await Promise.all([
          apiFetch('/clients', { headers: await getAuthHeaders() }),
          apiFetch('/expedientes', { headers: await getAuthHeaders() }),
          apiFetch('/agenda', { headers: await getAuthHeaders() }),
        ]);

        if (clientsResponse.ok) {
          setClientes((await clientsResponse.json()) as ClientOption[]);
        }

        if (expedientesResponse.ok) {
          setExpedientes((await expedientesResponse.json()) as ExpedienteOption[]);
        }

        if (eventsResponse.ok) {
          setEventos((await eventsResponse.json()) as AgendaEventItem[]);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la agenda.');
      }
    })();
  }, []);

  async function refresh() {
    const response = await apiFetch('/agenda', { headers: await getAuthHeaders() });
    if (response.ok) {
      setEventos((await response.json()) as AgendaEventItem[]);
    }
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
              setError('');
              const response = await apiFetch('/agenda', {
                method: 'POST',
                headers: await getAuthHeaders(),
                body: JSON.stringify({
                  ...form,
                  clienteId: form.clienteId || undefined,
                  expedienteId: form.expedienteId || undefined,
                }),
              });

              if (!response.ok) {
                const data = await response.json().catch(() => null);
                setError((data as { message?: string | string[] } | null)?.message?.toString() ?? 'No se pudo registrar el evento.');
                return;
              }

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
                {cliente.nombre}
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
                    const response = await apiFetch(`/agenda/${evento.id}`, {
                      method: 'PATCH',
                      headers: await getAuthHeaders(),
                      body: JSON.stringify({ estado: evento.estado === 'pendiente' ? 'completado' : 'pendiente' }),
                    });

                    if (!response.ok) {
                      const data = await response.json().catch(() => null);
                      setError((data as { message?: string | string[] } | null)?.message?.toString() ?? 'No se pudo actualizar el evento.');
                      return;
                    }

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
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
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
