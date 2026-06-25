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

type LegalDocument = {
  id: string;
  nombreArchivo: string;
  tipoDocumento: string;
  formato: 'docx' | 'pdf';
  plantilla: string;
  variables: Record<string, string> | null;
  contenidoTexto: string;
  contenidoBase64: string;
  observaciones: string | null;
  clienteId: string | null;
  expedienteId: string | null;
  cliente?: { id: string; nombre: string } | null;
  expediente?: { id: string; titulo: string } | null;
  createdAt: string;
};

type DocumentForm = {
  nombreArchivo: string;
  tipoDocumento: string;
  formato: 'docx' | 'pdf';
  plantilla: string;
  variablesText: string;
  clienteId: string;
  expedienteId: string;
  observaciones: string;
};

const initialForm: DocumentForm = {
  nombreArchivo: '',
  tipoDocumento: '',
  formato: 'docx',
  plantilla: '',
  variablesText: '{\n  "cliente": "",\n  "objeto": ""\n}',
  clienteId: '',
  expedienteId: '',
  observaciones: '',
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

function formatPrettyJson(value: Record<string, string> | null | undefined) {
  if (!value) {
    return '{\n  "cliente": "",\n  "objeto": ""\n}';
  }

  return JSON.stringify(value, null, 2);
}

function parseVariables(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return undefined;

  const parsed = JSON.parse(trimmed) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Las variables deben ser un objeto JSON.');
  }

  return Object.fromEntries(
    Object.entries(parsed as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '')]),
  );
}

export default function DocumentosPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [expedientes, setExpedientes] = useState<ExpedienteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DocumentForm>(initialForm);
  const [previewId, setPreviewId] = useState<string | null>(null);

  function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
  }

  function validateForm() {
    if (form.nombreArchivo.trim().length < 3) return 'El nombre de archivo es obligatorio (mínimo 3 caracteres).';
    if (form.tipoDocumento.trim().length < 3) return 'El tipo de documento es obligatorio.';
    if (form.plantilla.trim().length < 5) return 'La plantilla debe tener al menos 5 caracteres.';
    return null;
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [documentsResponse, clientsResponse, expedientesResponse] = await Promise.all([
        apiFetch('/api/documentos', { headers: getAuthHeaders() }),
        apiFetch('/api/clientes', { headers: getAuthHeaders() }),
        apiFetch('/api/expedientes', { headers: getAuthHeaders() }),
      ]);

      if (!documentsResponse.ok) {
        const data = await documentsResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los documentos.'));
      }

      if (!clientsResponse.ok) {
        const data = await clientsResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los clientes.'));
      }

      if (!expedientesResponse.ok) {
        const data = await expedientesResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los expedientes.'));
      }

      setDocuments((await documentsResponse.json()) as LegalDocument[]);
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

    let variables: Record<string, string> | undefined;
    try {
      variables = parseVariables(form.variablesText);
    } catch (parseError) {
      setFormError(parseError instanceof Error ? parseError.message : 'JSON de variables inválido.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        nombreArchivo: form.nombreArchivo.trim(),
        tipoDocumento: form.tipoDocumento.trim(),
        formato: form.formato,
        plantilla: form.plantilla.trim(),
        variables,
        clienteId: form.clienteId || undefined,
        expedienteId: form.expedienteId || undefined,
        observaciones: form.observaciones.trim() || undefined,
      };

      const response = await apiFetch(editingId ? `/api/documentos/${editingId}` : '/api/documentos', {
        method: editingId ? 'PATCH' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo guardar el documento.'));
      }

      setFormSuccess(editingId ? 'Documento actualizado.' : 'Documento creado.');
      resetForm();
      await loadData();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el documento.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(document: LegalDocument) {
    setEditingId(document.id);
    setForm({
      nombreArchivo: document.nombreArchivo,
      tipoDocumento: document.tipoDocumento,
      formato: document.formato,
      plantilla: document.plantilla,
      variablesText: formatPrettyJson(document.variables),
      clienteId: document.clienteId ?? '',
      expedienteId: document.expedienteId ?? '',
      observaciones: document.observaciones ?? '',
    });
    setFormError('');
    setFormSuccess('');
  }

  async function removeDocument(id: string) {
    setFormError('');
    setFormSuccess('');

    try {
      const response = await apiFetch(`/api/documentos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo eliminar el documento.'));
      }

      if (editingId === id) {
        resetForm();
      }
      if (previewId === id) {
        setPreviewId(null);
      }

      await loadData();
      setFormSuccess('Documento eliminado.');
    } catch (removeError) {
      setFormError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar el documento.');
    }
  }

  async function createQuickGenerated(format: 'docx' | 'pdf') {
    setFormError('');
    setFormSuccess('');

    let variables: Record<string, string> | undefined;
    try {
      variables = parseVariables(form.variablesText);
    } catch (parseError) {
      setFormError(parseError instanceof Error ? parseError.message : 'JSON de variables inválido.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = format === 'docx' ? '/api/documentos/generate-word' : '/api/documentos/generate-pdf';
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          nombreArchivo: form.nombreArchivo.trim() || `documento-${Date.now()}.${format}`,
          tipoDocumento: form.tipoDocumento.trim() || 'Documento legal',
          plantilla: form.plantilla.trim() || 'Documento de {{cliente}} sobre {{objeto}}.',
          variables,
          clienteId: form.clienteId || undefined,
          expedienteId: form.expedienteId || undefined,
          observaciones: form.observaciones.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo generar el documento.'));
      }

      setFormSuccess(`Documento ${format.toUpperCase()} generado.`);
      await loadData();
    } catch (generationError) {
      setFormError(generationError instanceof Error ? generationError.message : 'No se pudo generar el documento.');
    } finally {
      setSaving(false);
    }
  }

  const filteredExpedientes = form.clienteId
    ? expedientes.filter((expediente) => expediente.clienteId === form.clienteId)
    : expedientes;

  const previewDocument = previewId ? documents.find((doc) => doc.id === previewId) ?? null : null;

  return (
    <FeatureShell module={featureModules.documentos}>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[1rem] border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">{editingId ? 'Editar documento' : 'Nuevo documento'}</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <input
              value={form.nombreArchivo}
              onChange={(event) => setForm((current) => ({ ...current, nombreArchivo: event.target.value }))}
              placeholder="Nombre de archivo"
              className="lex-input mt-0"
              required
            />
            <input
              value={form.tipoDocumento}
              onChange={(event) => setForm((current) => ({ ...current, tipoDocumento: event.target.value }))}
              placeholder="Tipo de documento"
              className="lex-input mt-0"
              required
            />
            <select
              value={form.formato}
              onChange={(event) => setForm((current) => ({ ...current, formato: event.target.value as 'docx' | 'pdf' }))}
              className="lex-input mt-0"
            >
              <option value="docx">docx</option>
              <option value="pdf">pdf</option>
            </select>
            <textarea
              value={form.plantilla}
              onChange={(event) => setForm((current) => ({ ...current, plantilla: event.target.value }))}
              placeholder="Plantilla del documento. Usa {{variable}} para marcadores."
              className="lex-input mt-0"
              rows={5}
              required
            />
            <textarea
              value={form.variablesText}
              onChange={(event) => setForm((current) => ({ ...current, variablesText: event.target.value }))}
              placeholder='Variables en JSON, por ejemplo {"cliente":"Juan"}'
              className="lex-input mt-0 font-mono text-xs"
              rows={6}
            />
            <select
              value={form.clienteId}
              onChange={(event) => setForm((current) => ({ ...current, clienteId: event.target.value, expedienteId: '' }))}
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
              {filteredExpedientes.map((expediente) => (
                <option key={expediente.id} value={expediente.id}>
                  {expediente.titulo}
                </option>
              ))}
            </select>
            <textarea
              value={form.observaciones}
              onChange={(event) => setForm((current) => ({ ...current, observaciones: event.target.value }))}
              placeholder="Observaciones"
              className="lex-input mt-0"
              rows={2}
            />

            {formError ? <p className="lex-notice-error">{formError}</p> : null}
            {formSuccess ? <p className="lex-notice-success">{formSuccess}</p> : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="lex-button-primary"
              >
                {saving ? 'Guardando...' : editingId ? 'Actualizar documento' : 'Crear documento'}
              </button>
              <button
                type="button"
                onClick={() => createQuickGenerated('docx')}
                disabled={saving}
                className="lex-button-secondary"
              >
                Generar Word
              </button>
              <button
                type="button"
                onClick={() => createQuickGenerated('pdf')}
                disabled={saving}
                className="lex-button-secondary"
              >
                Generar PDF
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

        <section className="rounded-[1rem] border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">Documentos registrados</h2>

          {loading ? <p className="mt-4 text-sm text-slate-300">Cargando...</p> : null}
          {!loading && error ? <p className="mt-4 lex-notice-error">{error}</p> : null}

          {!loading && !error ? (
            <div className="mt-4 space-y-3">
              {documents.length === 0 ? <p className="text-sm text-slate-400">No hay documentos aún.</p> : null}
              {documents.map((document) => (
                <article key={document.id} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
                  <p className="font-semibold text-slate-50">{document.nombreArchivo}</p>
                  <p className="text-sm text-slate-300">Tipo: {document.tipoDocumento}</p>
                  <p className="text-sm text-slate-300">Formato: {document.formato.toUpperCase()}</p>
                  <p className="text-sm text-slate-300">Cliente: {document.cliente?.nombre || 'Sin cliente'}</p>
                  <p className="text-sm text-slate-300">Expediente: {document.expediente?.titulo || 'Sin expediente'}</p>
                  <p className="text-xs text-slate-400">{new Date(document.createdAt).toLocaleString()}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(document)}
                      className="lex-button-secondary px-3 py-1 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDocument(document.id)}
                      className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300"
                    >
                      Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewId((current) => (current === document.id ? null : document.id))}
                      className="lex-button-secondary px-3 py-1 text-xs"
                    >
                      {previewId === document.id ? 'Ocultar contenido' : 'Ver contenido'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {previewDocument ? (
        <section className="mt-6 rounded-[1rem] border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">Contenido: {previewDocument.nombreArchivo}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Vista de texto generado a partir de la plantilla y variables persistidas.
          </p>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
            {previewDocument.contenidoTexto}
          </pre>
        </section>
      ) : null}
    </FeatureShell>
  );
}
