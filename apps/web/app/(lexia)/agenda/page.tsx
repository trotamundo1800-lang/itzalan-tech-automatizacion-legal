'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FeatureShell } from '../feature-shell';
import { featureModules } from '../feature-data';
import { apiFetch } from '../../lib/api';

type ClientOption = {
  id: string;
  nombre: string;
};

type ExpedienteOption = {
  id: string;
  titulo: string;
  clienteId: string;
};

type AgendaEvent = {
  id: string;
  fechaHora: string;
  tipoEvento: 'audiencia' | 'vencimiento' | 'reunion' | 'diligencia';
  estado: 'pendiente' | 'completado' | 'cancelado';
  recordatorio: string | null;
  observaciones: string | null;
  clienteId: string | null;
  expedienteId: string | null;
  cliente?: { id: string; nombre: string } | null;
  expediente?: { id: string; titulo: string } | null;
};

type AgendaForm = {
  fechaHora: string;
  tipoEvento: 'audiencia' | 'vencimiento' | 'reunion' | 'diligencia';
  estado: 'pendiente' | 'completado' | 'cancelado';
  recordatorio: string;
  observaciones: string;
  clienteId: string;
  expedienteId: string;
};

const initialForm: AgendaForm = {
  fechaHora: new Date(Date.now() + 3600_000).toISOString().slice(0, 16),
  tipoEvento: 'audiencia' as const,
  estado: 'pendiente' as const,
  recordatorio: '',
  observaciones: '',
  clienteId: '',
  expedienteId: '',
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export default function AgendaPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [expedientes, setExpedientes] = useState<ExpedienteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AgendaForm>(initialForm);

  function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function validateForm() {
    if (!form.fechaHora) return 'Selecciona fecha y hora.';
    if (form.observaciones.trim().length > 0 && form.observaciones.trim().length < 3) {
      return 'Las observaciones deben tener al menos 3 caracteres.';
    }
    if (form.recordatorio.trim().length > 0 && form.recordatorio.trim().length < 3) {
      return 'El recordatorio debe tener al menos 3 caracteres.';
    }
    return null;
  }

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [eventsResponse, clientsResponse, expedientesResponse] = await Promise.all([
        apiFetch('/api/agenda', { headers: getAuthHeaders() }),
        apiFetch('/api/clientes', { headers: getAuthHeaders() }),
        apiFetch('/api/expedientes', { headers: getAuthHeaders() }),
      ]);

      if (!eventsResponse.ok) {
        const data = await eventsResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los eventos.'));
      }

      if (!clientsResponse.ok) {
        const data = await clientsResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los clientes.'));
      }

      if (!expedientesResponse.ok) {
        const data = await expedientesResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los expedientes.'));
      }

      setEvents((await eventsResponse.json()) as AgendaEvent[]);
      setClients((await clientsResponse.json()) as ClientOption[]);
      setExpedientes((await expedientesResponse.json()) as ExpedienteOption[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);

    try {
      const response = await apiFetch(editingId ? `/api/agenda/${editingId}` : '/api/agenda', {
        method: editingId ? 'PATCH' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          fechaHora: new Date(form.fechaHora).toISOString(),
          tipoEvento: form.tipoEvento,
          estado: form.estado,
          recordatorio: form.recordatorio.trim() || undefined,
          observaciones: form.observaciones.trim() || undefined,
          clienteId: form.clienteId || undefined,
          expedienteId: form.expedienteId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo guardar el evento.'));
      }

      setFormSuccess(editingId ? 'Evento actualizado.' : 'Evento creado.');
      resetForm();
      await loadData();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el evento.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(evento: AgendaEvent) {
    setEditingId(evento.id);
    setForm({
      fechaHora: evento.fechaHora.slice(0, 16),
      tipoEvento: evento.tipoEvento,
      estado: evento.estado,
      recordatorio: evento.recordatorio ?? '',
      observaciones: evento.observaciones ?? '',
      clienteId: evento.clienteId ?? '',
      expedienteId: evento.expedienteId ?? '',
    });
    setFormError('');
    setFormSuccess('');
  }

  async function removeEvent(id: string) {
    setFormError('');
    setFormSuccess('');

    try {
      const response = await apiFetch(`/api/agenda/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo eliminar el evento.'));
      }

      if (editingId === id) resetForm();
      await loadData();
      setFormSuccess('Evento eliminado.');
    } catch (removeError) {
      setFormError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar el evento.');
    }
  }

  return (
    <FeatureShell module={featureModules.agenda}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">{editingId ? 'Editar evento' : 'Nuevo evento'}</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              type="datetime-local"
              value={form.fechaHora}
              onChange={(event) => setForm((current) => ({ ...current, fechaHora: event.target.value }))}
              className="lex-input mt-0"
              required
            />
            <select
              value={form.tipoEvento}
              onChange={(event) => setForm((current) => ({ ...current, tipoEvento: event.target.value as typeof form.tipoEvento }))}
              className="lex-input mt-0"
            >
              <option value="audiencia">audiencia</option>
              <option value="vencimiento">vencimiento</option>
              <option value="reunion">reunión</option>
              <option value="diligencia">diligencia</option>
            </select>
            <select
              value={form.estado}
              onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as typeof form.estado }))}
              className="lex-input mt-0"
            >
              <option value="pendiente">pendiente</option>
              <option value="completado">completado</option>
              <option value="cancelado">cancelado</option>
            </select>
            <textarea
              value={form.recordatorio}
              onChange={(event) => setForm((current) => ({ ...current, recordatorio: event.target.value }))}
              placeholder="Recordatorio"
              className="lex-input mt-0"
              rows={2}
            />
            <textarea
              value={form.observaciones}
              onChange={(event) => setForm((current) => ({ ...current, observaciones: event.target.value }))}
              placeholder="Observaciones"
              className="lex-input mt-0"
              rows={3}
            />
            <select
              value={form.clienteId}
              onChange={(event) => setForm((current) => ({ ...current, clienteId: event.target.value }))}
              className="lex-input mt-0"
            >
              <option value="">Sin cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
                </option>
              ))}
            </select>
            <select
              value={form.expedienteId}
              onChange={(event) => setForm((current) => ({ ...current, expedienteId: event.target.value }))}
              className="lex-input mt-0"
            >
              <option value="">Sin expediente</option>
              {expedientes.map((expediente) => (
                <option key={expediente.id} value={expediente.id}>
                  {expediente.titulo}
                </option>
              ))}
            </select>

            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
            {formSuccess ? <p className="text-sm text-emerald-300">{formSuccess}</p> : null}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="lex-button-primary"
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar evento' : 'Crear evento'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="lex-button-secondary"
                >
                  Cancelar edición
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">Eventos registrados</h2>

          {loading ? <p className="mt-4 text-sm text-slate-300">Cargando...</p> : null}
          {!loading && error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {events.length === 0 ? <p className="text-sm text-slate-500">No hay eventos aún.</p> : null}
              {events.map((evento) => (
                <article key={evento.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-50">{evento.tipoEvento}</p>
                    <span className={evento.estado === 'completado' ? 'lex-badge-success' : evento.estado === 'cancelado' ? 'lex-badge-danger' : 'lex-badge-warning'}>
                      {evento.estado}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">Fecha: {new Date(evento.fechaHora).toLocaleString()}</p>
                  <p className="text-sm text-slate-300">Cliente: {evento.cliente?.nombre || 'Sin cliente'}</p>
                  <p className="text-sm text-slate-300">Expediente: {evento.expediente?.titulo || 'Sin expediente'}</p>
                  <p className="text-sm text-slate-300">Recordatorio: {evento.recordatorio || 'Sin recordatorio'}</p>
                  {evento.observaciones ? <p className="mt-2 text-sm text-slate-300">{evento.observaciones}</p> : null}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(evento)}
                      className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEvent(evento.id)}
                      className="rounded-lg border border-red-500/50 px-3 py-1 text-xs font-semibold text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </FeatureShell>
  );
}