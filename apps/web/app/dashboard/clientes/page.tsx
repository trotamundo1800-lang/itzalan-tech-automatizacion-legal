'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Button, Card, Input, SectionHeader, Select } from '../../../components/ui';
import { apiFetch } from '../../lib/api';

type ApiClient = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
  createdAt: string;
};

type ClientForm = Omit<ApiClient, 'id' | 'createdAt'>;

const initialForm: ClientForm = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  estado: 'activo',
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export default function DashboardClientesPage() {
  const [clientes, setClientes] = useState<ApiClient[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientForm>(initialForm);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [error, setError] = useState('');

  function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    if (!token) {
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filteredClientes = clientes.filter((cliente) => {
    const matchesQuery =
      cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
      cliente.email.toLowerCase().includes(search.toLowerCase()) ||
      cliente.telefono.toLowerCase().includes(search.toLowerCase());
    const matchesEstado = estadoFiltro === 'todos' ? true : cliente.estado === estadoFiltro;
    return matchesQuery && matchesEstado;
  });

  async function refresh() {
    setError('');
    try {
      const response = await apiFetch('/clients', { headers: getAuthHeaders() });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los clientes.'));
      }
      setClientes((await response.json()) as ApiClient[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los clientes.');
    }

    setForm(initialForm);
    setEditingId(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const response = await apiFetch(editingId ? `/clients/${editingId}` : '/clients', {
        method: editingId ? 'PATCH' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo guardar el cliente.'));
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el cliente.');
      return;
    }

    await refresh();
  }

  return (
    <>
      <Card title="Clientes" subtitle="CRUD de clientes">
        <SectionHeader
          title="Gestión de clientes"
          subtitle="Registro, edición y seguimiento comercial-jurídico"
          action={<Badge tone="neutral">{clientes.length} registros</Badge>}
        />
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <Input className="mt-0" placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))} required />
          <Input className="mt-0" placeholder="Teléfono" value={form.telefono} onChange={(e) => setForm((s) => ({ ...s, telefono: e.target.value }))} required />
          <Input type="email" className="mt-0" placeholder="Correo" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required />
          <Input className="mt-0 md:col-span-2" placeholder="Dirección" value={form.direccion} onChange={(e) => setForm((s) => ({ ...s, direccion: e.target.value }))} required />
          <Select className="mt-0" value={form.estado} onChange={(e) => setForm((s) => ({ ...s, estado: e.target.value as 'activo' | 'inactivo' }))}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">{editingId ? 'Actualizar cliente' : 'Nuevo cliente'}</Button>
            <Button type="button" variant="secondary" onClick={refresh}>Limpiar</Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </Card>

      <Card title="Listado de clientes">
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Buscar por nombre, correo o DNI"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Select className="mt-0" value={estadoFiltro} onChange={(event) => setEstadoFiltro(event.target.value as 'todos' | 'activo' | 'inactivo')}>
            <option value="todos">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
        </div>
        <div className="lex-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombre}</td>
                  <td>{cliente.telefono}</td>
                  <td>{cliente.email}</td>
                  <td>
                    <Badge tone={cliente.estado === 'activo' ? 'success' : 'neutral'}>{cliente.estado}</Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingId(cliente.id);
                          setForm({
                            nombre: cliente.nombre,
                            telefono: cliente.telefono,
                            email: cliente.email,
                            direccion: cliente.direccion,
                            estado: cliente.estado,
                          });
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          const response = await apiFetch(`/clients/${cliente.id}`, {
                            method: 'DELETE',
                            headers: getAuthHeaders(),
                          });

                          if (!response.ok) {
                            const data = await response.json().catch(() => null);
                            setError(parseApiError(data, 'No se pudo eliminar el cliente.'));
                            return;
                          }

                          await refresh();
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
