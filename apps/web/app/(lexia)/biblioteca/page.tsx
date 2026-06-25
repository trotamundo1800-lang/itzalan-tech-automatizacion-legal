'use client';

import { FormEvent, useEffect, useState } from 'react';
import { FeatureShell } from '../feature-shell';
import { featureModules } from '../feature-data';
import { apiFetch } from '../../lib/api';

type BibliotecaTipo = 'ley' | 'reglamento' | 'jurisprudencia' | 'doctrina' | 'formulario';
type BibliotecaEstado = 'activo' | 'archivado';

type BibliotecaItem = {
  id: string;
  titulo: string;
  tipo: BibliotecaTipo;
  descripcion: string;
  contenido?: string | null;
  fuente?: string | null;
  url?: string | null;
  estado: BibliotecaEstado;
  createdAt: string;
};

const TIPOS: BibliotecaTipo[] = ['ley', 'reglamento', 'jurisprudencia', 'doctrina', 'formulario'];

const TIPO_LABELS: Record<BibliotecaTipo, string> = {
  ley: 'Ley',
  reglamento: 'Reglamento',
  jurisprudencia: 'Jurisprudencia',
  doctrina: 'Doctrina',
  formulario: 'Formulario',
};

const TIPO_COLORS: Record<BibliotecaTipo, string> = {
  ley: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  reglamento: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  jurisprudencia: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  doctrina: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  formulario: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
};

const initialForm = {
  titulo: '',
  tipo: 'ley' as BibliotecaTipo,
  descripcion: '',
  contenido: '',
  fuente: '',
  url: '',
  estado: 'activo' as BibliotecaEstado,
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

export default function BibliotecaPage() {
  const [items, setItems] = useState<BibliotecaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<BibliotecaTipo | ''>('');

  function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
  }

  function validateForm() {
    if (form.titulo.trim().length < 3) return 'El título es obligatorio (mínimo 3 caracteres).';
    if (!TIPOS.includes(form.tipo)) return 'Selecciona un tipo válido.';
    if (form.descripcion.trim().length < 10) return 'La descripción requiere al menos 10 caracteres.';
    if (form.url && !/^https?:\/\/.+/.test(form.url.trim())) return 'La URL debe comenzar con http:// o https://';
    return null;
  }

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterTipo) params.set('tipo', filterTipo);
      if (search.trim()) params.set('q', search.trim());

      const res = await apiFetch(`/api/biblioteca?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(parseApiError(data, 'Error al cargar la biblioteca'));
        return;
      }
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTipo]);

  function startEdit(item: BibliotecaItem) {
    setEditingId(item.id);
    setForm({
      titulo: item.titulo,
      tipo: item.tipo,
      descripcion: item.descripcion,
      contenido: item.contenido ?? '',
      fuente: item.fuente ?? '',
      url: item.url ?? '',
      estado: item.estado,
    });
    setFormError('');
    setFormSuccess('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(initialForm);
    setFormError('');
    setFormSuccess('');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSaving(true);
    setFormError('');
    setFormSuccess('');

    const payload = {
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      ...(form.contenido.trim() ? { contenido: form.contenido.trim() } : {}),
      ...(form.fuente.trim() ? { fuente: form.fuente.trim() } : {}),
      ...(form.url.trim() ? { url: form.url.trim() } : {}),
      estado: form.estado,
    };

    try {
      const url = editingId ? `/api/biblioteca/${editingId}` : '/api/biblioteca';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(parseApiError(data, 'Error al guardar el recurso'));
        return;
      }
      setFormSuccess(editingId ? 'Recurso actualizado.' : 'Recurso agregado a la biblioteca.');
      setEditingId(null);
      setForm(initialForm);
      await loadItems();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este recurso de la biblioteca?')) return;
    try {
      const res = await apiFetch(`/api/biblioteca/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(parseApiError(data, 'Error al eliminar'));
        return;
      }
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    }
  }

  const displayed = search.trim()
    ? items.filter(
        (i) =>
          i.titulo.toLowerCase().includes(search.toLowerCase()) ||
          i.descripcion.toLowerCase().includes(search.toLowerCase()) ||
          (i.fuente ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  return (
    <FeatureShell module={featureModules['biblioteca']}>
      <div className="grid gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* ── Form panel ── */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-300">
              {editingId ? 'Editar recurso' : 'Agregar recurso'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as BibliotecaTipo }))}
                  className="lex-input w-full"
                >
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>{TIPO_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Título *</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej. Ley Federal del Trabajo"
                  className="lex-input w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Descripción *</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Resumen del contenido o alcance normativo"
                  rows={3}
                  className="lex-input w-full resize-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Contenido / Texto</label>
                <textarea
                  value={form.contenido}
                  onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
                  placeholder="Artículos relevantes, extractos o formulario completo"
                  rows={5}
                  className="lex-input w-full resize-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Fuente</label>
                <input
                  value={form.fuente}
                  onChange={(e) => setForm((f) => ({ ...f, fuente: e.target.value }))}
                  placeholder="DOF, SCJN, Cámara de Diputados…"
                  className="lex-input w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">URL de referencia</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://…"
                  className="lex-input w-full"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as BibliotecaEstado }))}
                  className="lex-input w-full"
                >
                  <option value="activo">Activo</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>

              {formError && <p className="rounded-lg bg-red-900/30 px-3 py-2 text-xs text-red-300">{formError}</p>}
              {formSuccess && <p className="rounded-lg bg-emerald-900/30 px-3 py-2 text-xs text-emerald-300">{formSuccess}</p>}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : editingId ? 'Actualizar' : 'Agregar'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── List panel ── */}
        <div className="space-y-4">
          {/* Search & filter bar */}
          <div className="flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadItems()}
              placeholder="Buscar por título, descripción o fuente…"
              className="lex-input min-w-[200px] flex-1"
            />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value as BibliotecaTipo | '')}
              className="lex-input w-44"
            >
              <option value="">Todos los tipos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{TIPO_LABELS[t]}</option>
              ))}
            </select>
            <button
              onClick={loadItems}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600"
            >
              Buscar
            </button>
          </div>

          {error && <p className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-300">{error}</p>}

          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">Cargando biblioteca…</p>
          ) : displayed.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              {search || filterTipo ? 'Sin resultados para esta búsqueda.' : 'La biblioteca está vacía. Agrega el primer recurso.'}
            </p>
          ) : (
            <div className="space-y-3">
              {displayed.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 transition hover:border-slate-600"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TIPO_COLORS[item.tipo]}`}>
                          {TIPO_LABELS[item.tipo]}
                        </span>
                        {item.estado === 'archivado' && (
                          <span className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-2.5 py-0.5 text-[11px] text-slate-400">
                            Archivado
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-100 leading-snug">{item.titulo}</h3>
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">{item.descripcion}</p>
                      {item.fuente && (
                        <p className="mt-1.5 text-xs text-slate-500">
                          <span className="text-slate-600">Fuente: </span>{item.fuente}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-cyan-400 hover:underline"
                        >
                          Ver referencia →
                        </a>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => startEdit(item)}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg border border-red-800/60 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/30"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {item.contenido && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-300">
                        Ver contenido
                      </summary>
                      <pre className="mt-2 max-h-40 overflow-y-auto rounded-lg bg-slate-950/60 p-3 text-xs text-slate-300 whitespace-pre-wrap">
                        {item.contenido}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FeatureShell>
  );
}
