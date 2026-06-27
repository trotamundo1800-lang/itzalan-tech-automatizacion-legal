'use client';

import { Bot, Brain, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, SectionHeader, Select, Textarea } from '../../../components/ui';
import { apiFetch, getAuthHeaders as getSessionAuthHeaders } from '../../lib/api';
import type { IaAnalysisType } from '../../../types';

const analysisTypes: IaAnalysisType[] = [
  'Análisis legal',
  'Resumen del caso',
  'Riesgos jurídicos',
  'Estrategia jurídica',
  'Probabilidad de éxito',
  'Redacción de documento legal',
];

export default function DashboardIaPage() {
  const [caso, setCaso] = useState('');
  const [analysisType, setAnalysisType] = useState<IaAnalysisType>('Análisis legal');
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');
  const [providerMode, setProviderMode] = useState<'openai' | 'local' | null>(null);
  const [historial, setHistorial] = useState<
    Array<{ id: string; consulta: string; respuesta: string; fecha: string; contextoJuridico: string; modo: string }>
  >([]);

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

  function mapAnalysisType(type: IaAnalysisType) {
    const mapping: Record<IaAnalysisType, string> = {
      'Análisis legal': 'analisis_juridico',
      'Resumen del caso': 'resumen',
      'Riesgos jurídicos': 'riesgos_legales',
      'Estrategia jurídica': 'estrategia_juridica',
      'Probabilidad de éxito': 'probabilidad_exito',
      'Redacción de documento legal': 'redaccion_documental',
    };
    return mapping[type];
  }

  async function refreshHistory() {
    setError('');
    try {
      const response = await apiFetch('/api/ia-juridica/historial?limit=25', { headers: await getAuthHeaders() });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo cargar historial IA.'));
      }

      setHistorial(
        (await response.json()) as Array<{
          id: string;
          consulta: string;
          respuesta: string;
          fecha: string;
          contextoJuridico: string;
          modo: string;
        }>,
      );
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : 'No se pudo cargar historial IA.');
    }
  }

  useEffect(() => {
    void (async () => {
      await refreshHistory();
    })();
  }, []);

  async function onAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiFetch('/api/ia-juridica/consultar', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          consulta: caso,
          tipoAnalisis: mapAnalysisType(analysisType),
          contexto: 'general',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo consultar IA Jurídica.'));
      }

  const data = (await response.json()) as { respuesta: string; modo?: 'openai' | 'local' };
      setRespuesta(data.respuesta);
  setProviderMode(data.modo ?? null);
      await refreshHistory();
    } catch (analyzeError) {
      setError(analyzeError instanceof Error ? analyzeError.message : 'No se pudo consultar IA Jurídica.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card title="IA Jurídica" subtitle="Módulo demo preparado para integración por OPENAI_API_KEY">
        <SectionHeader
          title="Asistente jurídico profesional"
          subtitle="Analiza riesgo, estrategia y redacción legal con formato estructurado"
          action={<Badge tone={providerMode === 'local' ? 'warning' : 'success'}>{providerMode === 'local' ? 'Modo local' : 'Modo API real'}</Badge>}
        />
        {providerMode === 'local' ? (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            El backend no encontró <span className="font-semibold">OPENAI_API_KEY</span>. La IA responde en modo local hasta configurar esa variable.
          </p>
        ) : null}
        <form onSubmit={onAnalyze} className="grid gap-3">
          <Textarea className="mt-0" rows={8} value={caso} onChange={(e) => setCaso(e.target.value)} placeholder="Pega el caso o hechos relevantes" required />
          <Select className="mt-0" value={analysisType} onChange={(e) => setAnalysisType(e.target.value as IaAnalysisType)}>
            {analysisTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" /> Analizando...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2"><Brain className="h-4 w-4" /> Analizar con IA</span>
            )}
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </Card>

      <Card title="Respuesta IA">
        <p className="whitespace-pre-line rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-200">
          {respuesta || 'Aquí se mostrará la respuesta del análisis.'}
        </p>
      </Card>

      <Card title="Historial de consultas IA">
        <ul className="space-y-2 text-sm text-slate-300">
          {historial.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
              <p className="flex items-center gap-2 font-semibold text-slate-100"><Bot className="h-4 w-4 text-cyan-300" /> {item.contextoJuridico} · {item.modo}</p>
              <p className="mt-1 line-clamp-2">{item.consulta}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(item.fecha).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
