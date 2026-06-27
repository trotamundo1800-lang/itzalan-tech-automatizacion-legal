'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Button, Card, Input, SectionHeader, Select } from '../../../components/ui';
import { apiFetch, getAuthHeaders as getSessionAuthHeaders } from '../../lib/api';

type ClientOption = {
  id: string;
  nombre: string;
};

type ApiExpediente = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  fechaApertura: string;
  clienteId: string;
  createdAt: string;
};

type ExpedienteForm = Omit<ApiExpediente, 'id' | 'createdAt'>;

const initialForm: ExpedienteForm = {
  clienteId: '',
  titulo: '',
  descripcion: '',
  tipo: '',
  estado: 'abierto' as const,
  fechaApertura: new Date().toISOString().slice(0, 10),
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export default function DashboardExpedientesPage() {
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [expedientes, setExpedientes] = useState<ApiExpediente[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpedienteForm>(initialForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'abierto' | 'en_proceso' | 'cerrado'>('todos');
  const [error, setError] = useState('');

  async function getAuthHeaders() {
    return getSessionAuthHeaders();
  }

  useEffect(() => {
    void refresh();
  }, []);

  const filteredExpedientes = expedientes.filter((expediente) => {
    const matchesSearch =
      expediente.titulo.toLowerCase().includes(search.toLowerCase()) ||
      expediente.tipo.toLowerCase().includes(search.toLowerCase()) ||
      expediente.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' ? true : expediente.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  async function refresh() {
    setError('');
    try {
      const [clientsResponse, expedientesResponse] = await Promise.all([
        apiFetch('/clients', { headers: await getAuthHeaders() }),
        apiFetch('/expedientes', { headers: await getAuthHeaders() }),
      ]);

      if (!clientsResponse.ok) {
        const data = await clientsResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los clientes.'));
      }

      if (!expedientesResponse.ok) {
        const data = await expedientesResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los expedientes.'));
      }

      const loadedClients = (await clientsResponse.json()) as ClientOption[];
      const loadedExpedientes = (await expedientesResponse.json()) as ApiExpediente[];
      setClients(loadedClients);
      setExpedientes(loadedExpedientes);
      setForm((current) => ({
        ...current,
        clienteId: current.clienteId || loadedClients[0]?.id || '',
      }));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos.');
    }

    setEditingId(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    try {
      const response = await apiFetch(editingId ? `/expedientes/${editingId}` : '/expedientes', {
        method: editingId ? 'PATCH' : 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo guardar el expediente.'));
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el expediente.');
      return;
    }

    await refresh();
    setForm((current) => ({ ...initialForm, clienteId: current.clienteId }));
  }

  return (
    <>
      <Card title="Expedientes" subtitle="CRUD de expedientes con número interno automático">
        <SectionHeader title="Gestión de expedientes" subtitle="Control por estado y cliente" />
        <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
          <Select className="mt-0" value={form.clienteId} onChange={(e) => setForm((s) => ({ ...s, clienteId: e.target.value }))}>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.nombre}
              </option>
            ))}
          </Select>
          <Input className="mt-0" placeholder="Título" value={form.titulo} onChange={(e) => setForm((s) => ({ ...s, titulo: e.target.value }))} required />
          <Input className="mt-0 md:col-span-2" placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))} required />
          <Input className="mt-0" placeholder="Tipo" value={form.tipo} onChange={(e) => setForm((s) => ({ ...s, tipo: e.target.value }))} required />
          <Select className="mt-0" value={form.estado} onChange={(e) => setForm((s) => ({ ...s, estado: e.target.value as 'abierto' | 'en_proceso' | 'cerrado' }))}>
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En proceso</option>
            <option value="cerrado">Cerrado</option>
          </Select>
          <Input type="date" className="mt-0" value={form.fechaApertura} onChange={(e) => setForm((s) => ({ ...s, fechaApertura: e.target.value }))} required />
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">{editingId ? 'Actualizar expediente' : 'Crear expediente'}</Button>
            <Button type="button" variant="secondary" onClick={refresh}>Limpiar</Button>
          </div>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </Card>

      <Card title="Listado de expedientes">
        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              placeholder="Buscar número, tipo o juzgado"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <Select className="mt-0" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'todos' | 'abierto' | 'en_proceso' | 'cerrado')}>
            <option value="todos">Todos</option>
            <option value="abierto">Abierto</option>
            <option value="en_proceso">En proceso</option>
            <option value="cerrado">Cerrado</option>
          </Select>
        </div>
        <div className="lex-table">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Cliente</th>
                <th>Fecha apertura</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpedientes.map((expediente) => (
                <tr key={expediente.id}>
                  <td>{expediente.titulo}</td>
                  <td>{expediente.tipo}</td>
                  <td>
                    <Badge
                      tone={
                        expediente.estado === 'abierto'
                          ? 'success'
                          : expediente.estado === 'en_proceso'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {expediente.estado}
                    </Badge>
                  </td>
                  <td>{clients.find((client) => client.id === expediente.clienteId)?.nombre ?? expediente.clienteId}</td>
                  <td>{expediente.fechaApertura}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingId(expediente.id);
                          setForm({
                            clienteId: expediente.clienteId,
                            titulo: expediente.titulo,
                            descripcion: expediente.descripcion,
                            tipo: expediente.tipo,
                            estado: expediente.estado,
                            fechaApertura: expediente.fechaApertura,
                          });
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          const response = await apiFetch(`/expedientes/${expediente.id}`, {
                            method: 'DELETE',
                            headers: await getAuthHeaders(),
                          });

                          if (!response.ok) {
                            const data = await response.json().catch(() => null);
                            setError(parseApiError(data, 'No se pudo eliminar el expediente.'));
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
