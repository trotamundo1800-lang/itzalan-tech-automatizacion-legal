'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { FeatureShell } from '../feature-shell';
import { featureModules } from '../feature-data';
import { apiFetch } from '../../lib/api';

type TipoDocumento = 'ley' | 'reglamento' | 'jurisprudencia' | 'doctrina' | 'formulario' | 'otro';

type BibliotecaDoc = {
  id: string;
  titulo: string;
  tipoDocumento: TipoDocumento;
  categoria: string;
  descripcion?: string | null;
  archivoNombre: string;
  mimeType: string;
  tamano: number;
  usuarioId: string | null;
  createdAt: string;
};

const TIPOS: TipoDocumento[] = ['ley', 'reglamento', 'jurisprudencia', 'doctrina', 'formulario', 'otro'];

const TIPO_LABELS: Record<TipoDocumento, string> = {
  ley: 'Ley',
  reglamento: 'Reglamento',
  jurisprudencia: 'Jurisprudencia',
  doctrina: 'Doctrina',
  formulario: 'Formulario',
  otro: 'Otro',
};

const TIPO_COLORS: Record<TipoDocumento, string> = {
  ley: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  reglamento: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  jurisprudencia: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  doctrina: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
  formulario: 'bg-cyan-900/40 text-cyan-300 border-cyan-700/50',
  otro: 'bg-slate-700/60 text-slate-300 border-slate-600',
};

const MIME_ICON: Record<string, string> = {
  'application/pdf': '📄',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'text/plain': '📃',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseApiError(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const msg = (data as { message?: string | string[] }).message;
    if (Array.isArray(msg)) return msg[0] ?? fallback;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

export default function BibliotecaPage() {
  const [docs, setDocs] = useState<BibliotecaDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('ley');
  const [categoria, setCategoria] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<TipoDocumento | ''>('');
  const [detail, setDetail] = useState<BibliotecaDoc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function getToken(): string {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    return token;
  }

  async function loadDocs() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filterTipo) params.set('tipoDocumento', filterTipo);
      if (search.trim()) params.set('q', search.trim());
      const res = await apiFetch(`/api/biblioteca?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(parseApiError(data, 'Error al cargar la biblioteca'));
        return;
      }
      setDocs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTipo]);

  function validateUpload(): string | null {
    if (titulo.trim().length < 3) return 'El título requiere al menos 3 caracteres.';
    if (!categoria.trim()) return 'La categoría es obligatoria.';
    if (!file) return 'Selecciona un archivo PDF, DOCX o TXT.';
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowed.includes(file.type)) return 'Tipo de archivo no permitido. Solo PDF, DOCX y TXT.';
    if (file.size > 20 * 1024 * 1024) return 'El archivo supera el límite de 20 MB.';
    return null;
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    const err = validateUpload();
    if (err) {
      setFormError(err);
      return;
    }

    setUploading(true);
    setFormError('');
    setFormSuccess('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('titulo', titulo.trim());
    formData.append('tipoDocumento', tipoDocumento);
    formData.append('categoria', categoria.trim());
    if (descripcion.trim()) formData.append('descripcion', descripcion.trim());
    formData.append('archivo', file!);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(parseApiError(body, 'Error al subir el archivo')));
            } catch {
              reject(new Error('Error al subir el archivo'));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Error de conexión al subir el archivo'));
        xhr.open('POST', '/api/biblioteca/upload');
        xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
        xhr.send(formData);
      });

      setFormSuccess('Documento subido correctamente.');
      setTitulo('');
      setCategoria('');
      setDescripcion('');
      setFile(null);
      setUploadProgress(0);
      if (fileRef.current) fileRef.current.value = '';
      await loadDocs();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: BibliotecaDoc) {
    if (!confirm(`¿Eliminar "${doc.titulo}"? Esta acción también borrará el archivo.`)) return;
    try {
      const res = await apiFetch(`/api/biblioteca/${doc.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const d = await res.json();
        setError(parseApiError(d, 'Error al eliminar'));
        return;
      }
      if (detail?.id === doc.id) setDetail(null);
      await loadDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión');
    }
  }

  function downloadUrl(id: string) {
    return `/api/biblioteca/${id}/file`;
  }

  const displayed = search.trim()
    ? docs.filter(
        (d) =>
          d.titulo.toLowerCase().includes(search.toLowerCase()) ||
          d.categoria.toLowerCase().includes(search.toLowerCase()) ||
          (d.descripcion ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : docs;

  return (
    <FeatureShell module={featureModules['biblioteca']}>
      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-cyan-300">Subir documento</h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Título *</label>
              <input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ley Federal del Trabajo"
                className="lex-input w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Tipo *</label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as TipoDocumento)}
                className="lex-input w-full"
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {TIPO_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Categoría *</label>
              <input
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Derecho laboral, Civil, Penal..."
                className="lex-input w-full"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Resumen del contenido"
                rows={3}
                className="lex-input w-full resize-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Archivo * (PDF, DOCX, TXT - max 20MB)</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-700 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-cyan-600"
              />
              {file && (
                <p className="mt-1 text-xs text-slate-500">
                  {file.name} - {formatBytes(file.size)}
                </p>
              )}
            </div>

            {uploading && (
              <div className="space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">Subiendo... {uploadProgress}%</p>
              </div>
            )}

            {formError && <p className="rounded-lg bg-red-900/30 px-3 py-2 text-xs text-red-300">{formError}</p>}
            {formSuccess && <p className="rounded-lg bg-emerald-900/30 px-3 py-2 text-xs text-emerald-300">{formSuccess}</p>}

            <button
              type="submit"
              disabled={uploading}
              className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {uploading ? 'Subiendo...' : 'Subir documento'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDocs()}
              placeholder="Buscar..."
              className="lex-input min-w-[180px] flex-1"
            />
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value as TipoDocumento | '')}
              className="lex-input w-44"
            >
              <option value="">Todos los tipos</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {TIPO_LABELS[t]}
                </option>
              ))}
            </select>
            <button onClick={loadDocs} className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600">
              Buscar
            </button>
          </div>

          {error && <p className="rounded-lg bg-red-900/30 px-4 py-3 text-sm text-red-300">{error}</p>}

          {loading ? (
            <p className="py-12 text-center text-sm text-slate-400">Cargando biblioteca...</p>
          ) : displayed.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">
              {search || filterTipo ? 'Sin resultados.' : 'La biblioteca está vacía. Sube el primer documento.'}
            </p>
          ) : (
            <div className="space-y-3">
              {displayed.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 transition hover:border-slate-600">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-lg">{MIME_ICON[doc.mimeType] ?? '📎'}</span>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TIPO_COLORS[doc.tipoDocumento]}`}
                        >
                          {TIPO_LABELS[doc.tipoDocumento]}
                        </span>
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">{doc.categoria}</span>
                      </div>

                      <h3 className="font-semibold leading-snug text-slate-100">{doc.titulo}</h3>

                      {doc.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-400">{doc.descripcion}</p>}

                      <p className="mt-1.5 text-xs text-slate-600">
                        {doc.archivoNombre} - {formatBytes(doc.tamano)} - {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        onClick={() => setDetail(doc)}
                        className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                      >
                        Detalle
                      </button>
                      <a
                        href={downloadUrl(doc.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-cyan-800/60 px-3 py-1.5 text-xs text-cyan-400 hover:bg-cyan-900/30"
                      >
                        Ver
                      </a>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="rounded-lg border border-red-800/60 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/30"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setDetail(null)}>
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold text-slate-100">{detail.titulo}</h3>
              <button onClick={() => setDetail(null)} className="text-slate-500 hover:text-slate-300">
                ✕
              </button>
            </div>

            <dl className="space-y-2 text-sm">
              {[
                ['Tipo', TIPO_LABELS[detail.tipoDocumento]],
                ['Categoría', detail.categoria],
                ['Archivo', detail.archivoNombre],
                ['Tamaño', formatBytes(detail.tamano)],
                ['Formato', detail.mimeType],
                ['Subido', new Date(detail.createdAt).toLocaleString('es-MX')],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
                  <dd className="text-slate-300">{value}</dd>
                </div>
              ))}
              {detail.descripcion && (
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-slate-500">Descripción</dt>
                  <dd className="text-slate-300">{detail.descripcion}</dd>
                </div>
              )}
            </dl>

            <div className="mt-5 flex gap-3">
              <a
                href={downloadUrl(detail.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-cyan-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-cyan-600"
              >
                Ver / descargar
              </a>
              <button
                onClick={() => {
                  handleDelete(detail);
                  setDetail(null);
                }}
                className="rounded-lg border border-red-800/60 px-4 py-2 text-sm text-red-400 hover:bg-red-900/30"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </FeatureShell>
  );
}
