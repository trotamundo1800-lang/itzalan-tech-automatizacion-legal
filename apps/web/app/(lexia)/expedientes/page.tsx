'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FeatureShell } from '../feature-shell';
import { featureModules } from '../feature-data';
import { apiFetch } from '../../lib/api';

type ClientOption = {
  id: string;
  nombre: string;
};

type Expediente = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  fechaApertura: string;
  clienteId: string;
  cliente?: {
    id: string;
    nombre: string;
  };
};

type IaConversationMessage = {
  id: string;
  preguntaUsuario: string;
  respuestaIa: string;
  modo: 'openai' | 'local';
  contextoJuridico: string;
  analisis: string;
  recomendaciones: string[];
  riesgos: string[];
  proyeccionCaso: string;
  createdAt: string;
};

type IaConversationSummary = {
  id: string;
  title: string;
  contextoJuridico: string;
  expedienteId: string | null;
  latestMessage: IaConversationMessage | null;
  messagesCount: number;
};

const initialForm = {
  titulo: '',
  descripcion: '',
  tipo: '',
  estado: 'abierto' as 'abierto' | 'en_proceso' | 'cerrado',
  fechaApertura: new Date().toISOString().slice(0, 10),
  clienteId: '',
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;

    if (Array.isArray(message)) {
      return message[0] ?? fallback;
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [iaByExpediente, setIaByExpediente] = useState<Record<string, IaConversationSummary[]>>({});

  function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;

    if (!token) {
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  function validateForm() {
    if (form.titulo.trim().length < 3) return 'El título es obligatorio.';
    if (form.descripcion.trim().length < 10) return 'La descripción requiere al menos 10 caracteres.';
    if (form.tipo.trim().length < 2) return 'El tipo es obligatorio.';
    if (!form.clienteId) return 'Selecciona un cliente.';
    if (!form.fechaApertura) return 'Selecciona fecha de apertura.';
    return null;
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function loadBaseData() {
    setLoading(true);
    setError('');

    try {
      const [expedientesResponse, clientsResponse] = await Promise.all([
        apiFetch('/api/expedientes', { headers: getAuthHeaders() }),
        apiFetch('/api/clientes', { headers: getAuthHeaders() }),
      ]);

      if (!expedientesResponse.ok) {
        const data = await expedientesResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los expedientes.'));
      }

      if (!clientsResponse.ok) {
        const data = await clientsResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los clientes para el formulario.'));
      }

      setExpedientes((await expedientesResponse.json()) as Expediente[]);
      setClients((await clientsResponse.json()) as ClientOption[]);

      const expedientesData = (await expedientesResponse.clone().json()) as Expediente[];
      const iaEntries = await Promise.all(
        expedientesData.map(async (expediente) => {
          const iaResponse = await apiFetch(`/api/ia-juridica/conversations?expedienteId=${expediente.id}`, {
            headers: getAuthHeaders(),
          });

          if (!iaResponse.ok) {
            return [expediente.id, []] as const;
          }

          const conversations = (await iaResponse.json()) as IaConversationSummary[];
          return [expediente.id, conversations] as const;
        }),
      );

      setIaByExpediente(Object.fromEntries(iaEntries));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBaseData();
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
      const response = await apiFetch(editingId ? `/api/expedientes/${editingId}` : '/api/expedientes', {
        method: editingId ? 'PATCH' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          titulo: form.titulo.trim(),
          descripcion: form.descripcion.trim(),
          tipo: form.tipo.trim(),
          estado: form.estado,
          fechaApertura: form.fechaApertura,
          clienteId: form.clienteId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo guardar el expediente.'));
      }

      setFormSuccess(editingId ? 'Expediente actualizado.' : 'Expediente creado.');
      resetForm();
      await loadBaseData();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el expediente.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(expediente: Expediente) {
    setEditingId(expediente.id);
    setForm({
      titulo: expediente.titulo,
      descripcion: expediente.descripcion,
      tipo: expediente.tipo,
      estado: expediente.estado,
      fechaApertura: expediente.fechaApertura,
      clienteId: expediente.clienteId,
    });
    setFormError('');
    setFormSuccess('');
  }

  async function removeExpediente(id: string) {
    setFormError('');
    setFormSuccess('');

    try {
      const response = await apiFetch(`/api/expedientes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo eliminar el expediente.'));
      }

      if (editingId === id) {
        resetForm();
      }

      await loadBaseData();
      setFormSuccess('Expediente eliminado.');
    } catch (removeError) {
      setFormError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar el expediente.');
    }
  }

  return (
    <FeatureShell module={featureModules.expedientes}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">{editingId ? 'Editar expediente' : 'Nuevo expediente'}</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              value={form.titulo}
              onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
              placeholder="Título del expediente"
              className="lex-input mt-0"
              required
            />
            <textarea
              value={form.descripcion}
              onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
              placeholder="Descripción"
              className="lex-input mt-0"
              rows={4}
              required
            />
            <input
              value={form.tipo}
              onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value }))}
              placeholder="Tipo de expediente"
              className="lex-input mt-0"
              required
            />
            <select
              value={form.estado}
              onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as 'abierto' | 'en_proceso' | 'cerrado' }))}
              className="lex-input mt-0"
            >
              <option value="abierto">abierto</option>
              <option value="en_proceso">en_proceso</option>
              <option value="cerrado">cerrado</option>
            </select>
            <input
              type="date"
              value={form.fechaApertura}
              onChange={(event) => setForm((current) => ({ ...current, fechaApertura: event.target.value }))}
              className="lex-input mt-0"
              required
            />
            <select
              value={form.clienteId}
              onChange={(event) => setForm((current) => ({ ...current, clienteId: event.target.value }))}
              className="lex-input mt-0"
              required
            >
              <option value="">Selecciona cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre}
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
                {saving ? 'Guardando...' : editingId ? 'Actualizar expediente' : 'Crear expediente'}
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
          <h2 className="text-xl font-semibold text-slate-50">Expedientes registrados</h2>

          {loading ? <p className="mt-4 text-sm text-slate-300">Cargando...</p> : null}
          {!loading && error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {expedientes.length === 0 ? <p className="text-sm text-slate-500">No hay expedientes aún.</p> : null}
              {expedientes.map((expediente) => (
                <article key={expediente.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-50">{expediente.titulo}</p>
                    <span className={expediente.estado === 'cerrado' ? 'lex-badge-success' : expediente.estado === 'en_proceso' ? 'lex-badge-warning' : 'lex-badge-neutral'}>
                      {expediente.estado}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">Tipo: {expediente.tipo}</p>
                  <p className="text-sm text-slate-300">Cliente: {expediente.cliente?.nombre || expediente.clienteId}</p>

                  <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">IA del expediente</p>
                    {(iaByExpediente[expediente.id] ?? []).length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">Sin consultas IA asociadas todavía.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {(iaByExpediente[expediente.id] ?? []).slice(0, 2).map((conversation) => (
                          <div key={conversation.id} className="rounded-md border border-slate-700 bg-slate-900/60 p-2">
                            <p className="text-xs font-semibold text-slate-200">{conversation.title}</p>
                            {conversation.latestMessage ? (
                              <>
                                <p className="mt-1 text-xs text-slate-300">Análisis: {conversation.latestMessage.analisis}</p>
                                <p className="mt-1 text-xs text-amber-300">Riesgos: {conversation.latestMessage.riesgos.join(' | ')}</p>
                                <p className="mt-1 text-xs text-slate-300">
                                  Recomendaciones: {conversation.latestMessage.recomendaciones.join(' | ')}
                                </p>
                                <p className="mt-1 text-xs text-emerald-300">Proyección: {conversation.latestMessage.proyeccionCaso}</p>
                              </>
                            ) : (
                              <p className="mt-1 text-xs text-slate-500">Conversación sin mensajes aún.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(expediente)}
                      className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExpediente(expediente.id)}
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
