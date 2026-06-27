'use client';

import { FileBadge2, FileText, ScrollText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Input, SectionHeader, Select, Textarea } from '../../../components/ui';
import { apiFetch, getAuthHeaders as getSessionAuthHeaders } from '../../lib/api';
import type { DocumentTemplate } from '../../../types';

const templates: DocumentTemplate[] = [
  'Contrato de servicios profesionales',
  'Carta de poder',
  'Carta de cobro',
  'Solicitud administrativa',
  'Dictamen legal',
  'Constancia',
  'Presupuesto legal',
];

export default function DashboardDocumentosPage() {
  const [template, setTemplate] = useState<DocumentTemplate>(templates[0]);
  const [titulo, setTitulo] = useState('');
  const [datos, setDatos] = useState('');
  const [formato, setFormato] = useState<'docx' | 'pdf'>('pdf');
  const [expedienteId, setExpedienteId] = useState('');
  const [preview, setPreview] = useState('');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<
    Array<{
      id: string;
      nombreArchivo: string;
      tipoDocumento: string;
      formato: 'docx' | 'pdf';
      plantilla: string;
      observaciones: string | null;
      expedienteId: string | null;
      createdAt: string;
      generations?: Array<{
        id: string;
        formato: 'docx' | 'pdf';
        nombreArchivo: string;
        createdAt: string;
      }>;
    }>
  >([]);
  const [expedientes, setExpedientes] = useState<Array<{ id: string; numeroInterno: string; tipo: string }>>([]);

  async function getAuthHeaders() {
    return getSessionAuthHeaders();
  }

  function parseApiError(data: unknown, fallback: string) {
    if (typeof data === 'object' && data !== null && 'message' in data) {
      const message = (data as { message?: string | string[] }).message;
      if (Array.isArray(message)) return message[0] ?? fallback;
      if (typeof message === 'string' && message.trim()) return message;
    }
    return fallback;
  }

  async function refresh() {
    setError('');
    try {
      const [documentosResponse, expedientesResponse] = await Promise.all([
        apiFetch('/documentos', { headers: await getAuthHeaders() }),
        apiFetch('/expedientes', { headers: await getAuthHeaders() }),
      ]);

      if (!documentosResponse.ok) {
        const data = await documentosResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los documentos.'));
      }

      if (!expedientesResponse.ok) {
        const data = await expedientesResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los expedientes.'));
      }

      const docs = (await documentosResponse.json()) as Array<{
        id: string;
        nombreArchivo: string;
        tipoDocumento: string;
        formato: 'docx' | 'pdf';
        plantilla: string;
        observaciones: string | null;
        expedienteId: string | null;
        createdAt: string;
        generations?: Array<{
          id: string;
          formato: 'docx' | 'pdf';
          nombreArchivo: string;
          createdAt: string;
        }>;
      }>;
      const exps = (await expedientesResponse.json()) as Array<{ id: string; numeroInterno: string; tipo: string }>;

      setDocumentos(docs);
      setExpedientes(exps);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los datos.');
    }
  }

  function resetForm() {
    setEditingId(null);
    setTemplate(templates[0]);
    setTitulo('');
    setDatos('');
    setFormato('pdf');
    setExpedienteId('');
    setPreview('');
  }

  function extractFileName(contentDisposition: string | null, fallback: string) {
    if (!contentDisposition) {
      return fallback;
    }

    const match = contentDisposition.match(/filename="?([^";]+)"?/i);
    return match?.[1] ?? fallback;
  }

  async function downloadGenerated(documentId: string, outputFormat: 'docx' | 'pdf') {
    setError('');
    const key = `${documentId}:${outputFormat}`;
    setDownloadingKey(key);
    try {
      const response = await apiFetch(`/documentos/${documentId}/generar`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ formato: outputFormat }),
      });

      if (!response.ok) {
        let message = 'No se pudo generar el documento.';
        try {
          const data = await response.json();
          message = parseApiError(data, message);
        } catch {
          // Ignore JSON parse errors for binary responses.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const fallbackName = `documento.${outputFormat}`;
      const fileName = extractFileName(response.headers.get('content-disposition'), fallbackName);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setSaved(`Descarga ${outputFormat.toUpperCase()} generada correctamente.`);
      await refresh();
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'No se pudo generar el documento.');
    } finally {
      setDownloadingKey(null);
    }
  }

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, []);

  return (
    <>
      <Card title="Generador de documentos legales" subtitle="Selecciona plantilla y genera vista previa">
        <SectionHeader title="Plantillas legales" subtitle="Selecciona un tipo de documento para iniciar la redaccion" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTemplate(item)}
              className={`rounded-xl border p-3 text-left transition ${
                template === item
                  ? 'border-blue-600/70 bg-blue-900/20'
                  : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-100">{item}</span>
                <Badge tone={template === item ? 'success' : 'neutral'}>{template === item ? 'Activo' : 'Plantilla'}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-400">Formato optimizado para gestion juridica profesional.</p>
            </button>
          ))}
        </div>

        <form
          className="mt-6 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setSaved('');
            setLoading(true);

            const payload = {
              nombreArchivo: titulo,
              tipoDocumento: template,
              formato,
              plantilla: datos,
              observaciones: `Generado desde dashboard (${template})`,
              ...(expedienteId ? { expedienteId } : {}),
            };

            try {
              const response = await apiFetch(editingId ? `/documentos/${editingId}` : '/documentos', {
                method: editingId ? 'PATCH' : 'POST',
                headers: await getAuthHeaders(),
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(parseApiError(data, 'No se pudo guardar el documento.'));
              }

              const savedDoc = (await response.json()) as {
                nombreArchivo: string;
                formato: 'docx' | 'pdf';
                contenidoTexto: string;
              };

              setPreview(savedDoc.contenidoTexto);
              setSaved(editingId ? 'Documento actualizado.' : 'Documento creado y guardado.');
              await refresh();

              if (!editingId) {
                setTitulo('');
                setDatos('');
              }
            } catch (saveError) {
              setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el documento.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Select className="mt-0" value={template} onChange={(e) => setTemplate(e.target.value as DocumentTemplate)}>
            {templates.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select className="mt-0" value={formato} onChange={(e) => setFormato(e.target.value as 'docx' | 'pdf')}>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
          </Select>
          <Input className="mt-0" placeholder="Titulo del documento" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          <Textarea className="mt-0" rows={6} placeholder="Datos para el documento" value={datos} onChange={(e) => setDatos(e.target.value)} required />
          <Select className="mt-0" value={expedienteId} onChange={(e) => setExpedienteId(e.target.value)}>
            <option value="">Sin expediente</option>
            {expedientes.map((expediente) => (
              <option key={expediente.id} value={expediente.id}>
                {expediente.numeroInterno} - {expediente.tipo}
              </option>
            ))}
          </Select>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              <FileText className="mr-2 h-4 w-4" /> {loading ? 'Guardando...' : editingId ? 'Actualizar documento' : 'Crear documento'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!editingId || downloadingKey === `${editingId}:docx`}
              onClick={() => {
                if (!editingId) return;
                void downloadGenerated(editingId, 'docx');
              }}
            >
              <FileBadge2 className="mr-2 h-4 w-4" /> {downloadingKey === `${editingId}:docx` ? 'Generando Word...' : 'Descargar Word'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!editingId || downloadingKey === `${editingId}:pdf`}
              onClick={() => {
                if (!editingId) return;
                void downloadGenerated(editingId, 'pdf');
              }}
            >
              <ScrollText className="mr-2 h-4 w-4" /> {downloadingKey === `${editingId}:pdf` ? 'Generando PDF...' : 'Descargar PDF'}
            </Button>
            <Button type="button" variant="ghost" onClick={resetForm}>
              Limpiar
            </Button>
          </div>
          {saved ? <p className="lex-notice-success">{saved}</p> : null}
          {error ? <p className="lex-notice-error">{error}</p> : null}
        </form>
      </Card>

      <Card title="Vista previa">
        <pre className="whitespace-pre-wrap rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-200">
          {preview || 'Genera un documento para ver la vista previa.'}
        </pre>
      </Card>

      <Card title="Historial documental">
        <ul className="space-y-2 text-sm text-slate-300">
          {documentos.map((documento) => (
            <li key={documento.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p>
                  {documento.nombreArchivo} - {documento.tipoDocumento} - {documento.formato.toUpperCase()}
                </p>
                <Badge tone="neutral">{new Date(documento.createdAt).toLocaleString()}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-slate-400">{documento.plantilla}</p>
              <p className="mt-1 text-xs text-slate-500">
                Historial de generacion: {documento.generations?.length ?? 0}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void downloadGenerated(documento.id, 'docx');
                  }}
                  disabled={downloadingKey === `${documento.id}:docx`}
                >
                  <FileBadge2 className="mr-2 h-4 w-4" /> {downloadingKey === `${documento.id}:docx` ? 'Generando Word...' : 'Descargar Word'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void downloadGenerated(documento.id, 'pdf');
                  }}
                  disabled={downloadingKey === `${documento.id}:pdf`}
                >
                  <ScrollText className="mr-2 h-4 w-4" /> {downloadingKey === `${documento.id}:pdf` ? 'Generando PDF...' : 'Descargar PDF'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={async () => {
                    setError('');
                    try {
                      const response = await apiFetch(`/documentos/${documento.id}`, { headers: await getAuthHeaders() });
                      
                      if (!response.ok) {
                        const data = await response.json().catch(() => null);
                        throw new Error(parseApiError(data, 'No se pudo cargar el documento.'));
                      }

                      const fullDoc = (await response.json()) as {
                        id: string;
                        nombreArchivo: string;
                        tipoDocumento: string;
                        formato: 'docx' | 'pdf';
                        plantilla: string;
                        expedienteId: string | null;
                        contenidoTexto: string;
                      };

                      setEditingId(fullDoc.id);
                      setTitulo(fullDoc.nombreArchivo);
                      setTemplate(fullDoc.tipoDocumento as DocumentTemplate);
                      setFormato(fullDoc.formato);
                      setDatos(fullDoc.plantilla);
                      setExpedienteId(fullDoc.expedienteId ?? '');
                      setPreview(fullDoc.contenidoTexto);
                      setSaved('Documento cargado para edicion.');
                    } catch (viewError) {
                      setError(viewError instanceof Error ? viewError.message : 'No se pudo cargar el documento.');
                    }
                  }}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    setError('');
                    try {
                      const response = await apiFetch(`/documentos/${documento.id}`, {
                        method: 'DELETE',
                        headers: await getAuthHeaders(),
                      });

                      if (!response.ok) {
                        const data = await response.json().catch(() => null);
                        throw new Error(parseApiError(data, 'No se pudo eliminar el documento.'));
                      }

                      await refresh();
                      if (editingId === documento.id) {
                        resetForm();
                      }
                      setSaved('Documento eliminado.');
                    } catch (removeError) {
                      setError(removeError instanceof Error ? removeError.message : 'No se pudo eliminar el documento.');
                    }
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
