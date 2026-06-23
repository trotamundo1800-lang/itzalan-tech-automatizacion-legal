'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FeatureShell } from '../feature-shell';
import { featureModules } from '../feature-data';
import { apiFetch } from '../../lib/api';

type Client = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
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
        <section className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              value={form.nombre}
              onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
              placeholder="Nombre completo"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Correo"
              type="email"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
            <input
              value={form.telefono}
              onChange={(event) => setForm((current) => ({ ...current, telefono: event.target.value }))}
              placeholder="Teléfono"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={form.direccion}
              onChange={(event) => setForm((current) => ({ ...current, direccion: event.target.value }))}
              placeholder="Dirección"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              rows={3}
              required
            />
            <select
              value={form.estado}
              onChange={(event) => setForm((current) => ({ ...current, estado: event.target.value as 'activo' | 'inactivo' }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>

            {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
            {formSuccess ? <p className="text-sm text-emerald-700">{formSuccess}</p> : null}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar cliente' : 'Crear cliente'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Cancelar edición
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Clientes registrados</h2>

          {loading ? <p className="mt-4 text-sm text-slate-600">Cargando...</p> : null}
          {!loading && error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {clients.length === 0 ? <p className="text-sm text-slate-500">No hay clientes aún.</p> : null}
              {clients.map((client) => (
                <article key={client.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="font-semibold text-slate-900">{client.nombre}</p>
                  <p className="text-sm text-slate-600">{client.email}</p>
                  <p className="text-sm text-slate-600">{client.telefono}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{client.estado}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(client)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeClient(client.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700"
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
