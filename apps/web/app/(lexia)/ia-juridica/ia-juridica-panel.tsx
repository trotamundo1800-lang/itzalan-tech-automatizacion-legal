'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type DocumentoOption = {
  id: string;
  nombreArchivo: string;
  tipoDocumento: string;
};

type ExpedienteOption = {
  id: string;
  titulo: string;
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export function IaJuridicaPanel() {
  const [documentos, setDocumentos] = useState<DocumentoOption[]>([]);
  const [expedientes, setExpedientes] = useState<ExpedienteOption[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState('');

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    analisis: string;
    resumenRiesgos: string;
    recomendaciones: string[];
  } | null>(null);
  const [analysisForm, setAnalysisForm] = useState({
    documentoId: '',
    contenido: '',
    pregunta: '',
  });

  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [draftResult, setDraftResult] = useState<{ tipoBorrador: string; borrador: string } | null>(null);
  const [draftForm, setDraftForm] = useState({
    tipoBorrador: 'Demanda civil',
    hechos: '',
    objetivo: '',
  });

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [summaryResult, setSummaryResult] = useState<{
    expedienteId: string;
    resumen: string;
    puntosClave: string[];
  } | null>(null);
  const [summaryExpedienteId, setSummaryExpedienteId] = useState('');

  function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
  }

  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);
      setMetaError('');

      try {
        const [docsResponse, expResponse] = await Promise.all([
          apiFetch('/api/documentos', { headers: getAuthHeaders() }),
          apiFetch('/api/expedientes', { headers: getAuthHeaders() }),
        ]);

        if (!docsResponse.ok) {
          const data = await docsResponse.json().catch(() => null);
          throw new Error(parseApiError(data, 'No se pudieron cargar los documentos.'));
        }

        if (!expResponse.ok) {
          const data = await expResponse.json().catch(() => null);
          throw new Error(parseApiError(data, 'No se pudieron cargar los expedientes.'));
        }

        const docsData = (await docsResponse.json()) as DocumentoOption[];
        const expData = (await expResponse.json()) as ExpedienteOption[];
        setDocumentos(docsData);
        setExpedientes(expData);
      } catch (loadError) {
        setMetaError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información base.');
      } finally {
        setLoadingMeta(false);
      }
    }

    loadMeta();
  }, []);

  async function handleAnalyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalysisLoading(true);
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const payload = {
        documentoId: analysisForm.documentoId || undefined,
        contenido: analysisForm.contenido.trim() || undefined,
        pregunta: analysisForm.pregunta.trim() || undefined,
      };

      const response = await apiFetch('/api/ia-juridica/analizar-documento', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo analizar el documento.'));
      }

      setAnalysisResult((await response.json()) as { analisis: string; resumenRiesgos: string; recomendaciones: string[] });
    } catch (requestError) {
      setAnalysisError(requestError instanceof Error ? requestError.message : 'No se pudo analizar el documento.');
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function handleGenerateDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDraftLoading(true);
    setDraftError('');
    setDraftResult(null);

    try {
      const response = await apiFetch('/api/ia-juridica/generar-borrador', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tipoBorrador: draftForm.tipoBorrador.trim(),
          hechos: draftForm.hechos.trim(),
          objetivo: draftForm.objetivo.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo generar el borrador legal.'));
      }

      setDraftResult((await response.json()) as { tipoBorrador: string; borrador: string });
    } catch (requestError) {
      setDraftError(requestError instanceof Error ? requestError.message : 'No se pudo generar el borrador legal.');
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleSummary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSummaryLoading(true);
    setSummaryError('');
    setSummaryResult(null);

    try {
      const response = await apiFetch('/api/ia-juridica/resumen-expediente', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ expedienteId: summaryExpedienteId || undefined }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo resumir el expediente.'));
      }

      setSummaryResult((await response.json()) as { expedienteId: string; resumen: string; puntosClave: string[] });
    } catch (requestError) {
      setSummaryError(requestError instanceof Error ? requestError.message : 'No se pudo resumir el expediente.');
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {loadingMeta ? <p className="text-sm text-slate-600">Cargando documentos y expedientes...</p> : null}
      {metaError ? <p className="text-sm text-red-600">{metaError}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Analizar documento</h2>
          <form onSubmit={handleAnalyze} className="mt-4 space-y-4">
            <select
              value={analysisForm.documentoId}
              onChange={(event) => setAnalysisForm((current) => ({ ...current, documentoId: event.target.value }))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            >
              <option value="">Sin documento guardado</option>
              {documentos.map((documento) => (
                <option key={documento.id} value={documento.id}>
                  {documento.nombreArchivo} - {documento.tipoDocumento}
                </option>
              ))}
            </select>
            <textarea
              value={analysisForm.contenido}
              onChange={(event) => setAnalysisForm((current) => ({ ...current, contenido: event.target.value }))}
              placeholder="Pega contenido legal si no quieres usar un documento guardado"
              rows={5}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
            <input
              value={analysisForm.pregunta}
              onChange={(event) => setAnalysisForm((current) => ({ ...current, pregunta: event.target.value }))}
              placeholder="Pregunta guía (opcional)"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
            />
            {analysisError ? <p className="text-sm text-red-600">{analysisError}</p> : null}
            <button type="submit" disabled={analysisLoading} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              {analysisLoading ? 'Analizando...' : 'Analizar documento'}
            </button>
          </form>
          {analysisResult ? (
            <div className="mt-4 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-900">Resultado del análisis</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{analysisResult.analisis}</p>
              <p className="text-sm text-slate-700">Riesgos: {analysisResult.resumenRiesgos}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {analysisResult.recomendaciones.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Generar borrador legal</h2>
          <form onSubmit={handleGenerateDraft} className="mt-4 space-y-4">
            <input
              value={draftForm.tipoBorrador}
              onChange={(event) => setDraftForm((current) => ({ ...current, tipoBorrador: event.target.value }))}
              placeholder="Tipo de borrador"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={draftForm.hechos}
              onChange={(event) => setDraftForm((current) => ({ ...current, hechos: event.target.value }))}
              placeholder="Hechos relevantes"
              rows={4}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
            <textarea
              value={draftForm.objetivo}
              onChange={(event) => setDraftForm((current) => ({ ...current, objetivo: event.target.value }))}
              placeholder="Objetivo jurídico"
              rows={3}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              required
            />
            {draftError ? <p className="text-sm text-red-600">{draftError}</p> : null}
            <button type="submit" disabled={draftLoading} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
              {draftLoading ? 'Generando...' : 'Generar borrador'}
            </button>
          </form>
          {draftResult ? (
            <div className="mt-4 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <p className="text-sm font-semibold text-slate-900">{draftResult.tipoBorrador}</p>
              <p className="whitespace-pre-line text-sm text-slate-700">{draftResult.borrador}</p>
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Resumir expediente</h2>
        <form onSubmit={handleSummary} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={summaryExpedienteId}
            onChange={(event) => setSummaryExpedienteId(event.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm sm:max-w-md"
            required
          >
            <option value="">Selecciona expediente</option>
            {expedientes.map((expediente) => (
              <option key={expediente.id} value={expediente.id}>
                {expediente.titulo}
              </option>
            ))}
          </select>
          <button type="submit" disabled={summaryLoading} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            {summaryLoading ? 'Resumiendo...' : 'Resumir expediente'}
          </button>
        </form>

        {summaryError ? <p className="mt-3 text-sm text-red-600">{summaryError}</p> : null}

        {summaryResult ? (
          <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-sm text-slate-700 whitespace-pre-line">{summaryResult.resumen}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {summaryResult.puntosClave.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
