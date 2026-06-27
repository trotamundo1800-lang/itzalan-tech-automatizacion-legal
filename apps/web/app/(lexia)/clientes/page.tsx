'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FeatureShell } from '../feature-shell';
import { featureModules } from '../feature-data';
import { apiFetch, IA_JURIDICA_API_PREFIX } from '../../lib/api';

type Client = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
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
  clienteId: string | null;
  latestMessage: IaConversationMessage | null;
  messagesCount: number;
};

const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  estado: 'activo' as 'activo' | 'inactivo',
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

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [iaByCliente, setIaByCliente] = useState<Record<string, IaConversationSummary[]>>({});

  function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;

    if (!token) {
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function validateForm() {
    if (form.nombre.trim().length < 2) return 'El nombre es obligatorio (mínimo 2 caracteres).';
    if (!form.email.includes('@')) return 'Ingresa un correo válido.';
    if (form.telefono.trim().length < 7) return 'Ingresa un teléfono válido.';
    if (form.direccion.trim().length < 5) return 'La dirección es obligatoria.';
    return null;
  }

  async function loadClients() {
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch('/api/clientes', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los clientes.'));
      }

      const data = (await response.json()) as Client[];
      setClients(data);

      const iaEntries = await Promise.all(
        data.map(async (client) => {
          const iaResponse = await apiFetch(`${IA_JURIDICA_API_PREFIX}/conversations?clienteId=${client.id}`, {
            headers: getAuthHeaders(),
          });

          if (!iaResponse.ok) {
            return [client.id, []] as const;
          }

          const conversations = (await iaResponse.json()) as IaConversationSummary[];
          return [client.id, conversations] as const;
        }),
      );

      setIaByCliente(Object.fromEntries(iaEntries));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los clientes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
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
      const response = await apiFetch(editingId ? `/api/clientes/${editingId}` : '/api/clientes', {
        method: editingId ? 'PATCH' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          telefono: form.telefono.trim(),
          direccion: form.direccion.trim(),
          estado: form.estado,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo guardar el cliente.'));
      }

      setFormSuccess(editingId ? 'Cliente actualizado.' : 'Cliente creado.');
      resetForm();
      await loadClients();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el cliente.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      nombre: client.nombre,
      email: client.email,
      telefono: client.telefono,
      direccion: client.direccion,
      estado: client.estado,
    });
    setFormError('');
    setFormSuccess('');
  }

  async function removeClient(id: string) {
    setFormError('');
    setFormSuccess('');

    try {
      const response = await apiFetch(`/api/clientes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo eliminar el cliente.'));
      }

      if (editingId === id) {
        resetForm();
      }

      await loadClients();
      setFormSuccess('Cliente eliminado.');
    } catch (removeError) {
      setFormError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar el cliente.');
    }
  }

  return (
    <FeatureShell module={featureModules.clientes}>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">{editingId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              value={form.nombre}
              onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
              placeholder="Nombre completo"
              className="lex-input mt-0"
              required
            />
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Correo"
              type="email"
              className="lex-input mt-0"
              required
            />
            <input
              value={form.telefono}
              onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
              placeholder="Teléfono"
              className="lex-input mt-0"
              required
            />
            <textarea
              value={form.direccion}
              onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))}
              placeholder="Dirección"
              className="lex-input mt-0"
              rows={3}
              required
            />
            <select
              value={form.estado}
              onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as 'activo' | 'inactivo' }))}
              className="lex-input mt-0"
            >
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>

            {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
            {formSuccess ? <p className="text-sm text-emerald-300">{formSuccess}</p> : null}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="lex-button-primary"
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar cliente' : 'Crear cliente'}
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
          <h2 className="text-xl font-semibold text-slate-50">Clientes registrados</h2>

          {loading ? <p className="mt-4 text-sm text-slate-300">Cargando...</p> : null}
          {!loading && error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {clients.length === 0 ? <p className="text-sm text-slate-500">No hay clientes aún.</p> : null}
              {clients.map((client) => (
                <article key={client.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-50">{client.nombre}</p>
                    <span className={client.estado === 'activo' ? 'lex-badge-success' : 'lex-badge-neutral'}>{client.estado}</span>
                  </div>
                  <p className="text-sm text-slate-300">{client.email}</p>
                  <p className="text-sm text-slate-300">{client.telefono}</p>

                  <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/40 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Consultas IA del cliente</p>
                    {(iaByCliente[client.id] ?? []).length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">Sin consultas IA registradas para este cliente.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {(iaByCliente[client.id] ?? []).slice(0, 2).map((conversation) => (
                          <div key={conversation.id} className="rounded-md border border-slate-700 bg-slate-900/60 p-2">
                            <p className="text-xs font-semibold text-slate-200">{conversation.title}</p>
                            <p className="text-xs text-slate-300">Contexto: {conversation.contextoJuridico}</p>
                            {conversation.latestMessage ? (
                              <>
                                <p className="mt-1 text-xs text-slate-300">Análisis: {conversation.latestMessage.analisis}</p>
                                <p className="mt-1 text-xs text-amber-300">Riesgos: {conversation.latestMessage.riesgos.join(' | ')}</p>
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
                      onClick={() => startEdit(client)}
                      className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeClient(client.id)}
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
