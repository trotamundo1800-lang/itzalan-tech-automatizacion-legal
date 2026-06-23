'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type ContractResponse = {
  id: string;
  createdAt: string;
  updatedAt: string;
  tipoContrato: string;
  nombreCliente: string;
  descripcionCaso: string;
  titulo: string;
  resumen: string;
  clausulasSugeridas: string[];
};

const contractTypes = [
  'Contrato de prestación de servicios',
  'Contrato de confidencialidad',
  'Contrato de compraventa',
  'Contrato mercantil personalizado',
];

export function ContractsForm() {
  const [tipoContrato, setTipoContrato] = useState(contractTypes[0]);
  const [nombreCliente, setNombreCliente] = useState('');
  const [descripcionCaso, setDescripcionCaso] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ContractResponse | null>(null);
  const [drafts, setDrafts] = useState<ContractResponse[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [draftsError, setDraftsError] = useState('');

  function getAuthHeaders() {
    const accessToken =
      typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;

    if (!accessToken) {
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  useEffect(() => {
    async function loadDrafts() {
      setDraftsLoading(true);
      setDraftsError('');

      try {
        const response = await apiFetch('/api/contracts/drafts', {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Tu sesión no es válida para consultar borradores.');
          }
          throw new Error('No se pudieron cargar los borradores guardados.');
        }

        const data = (await response.json()) as ContractResponse[];
        setDrafts(data);
      } catch (loadError) {
        setDraftsError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los borradores.');
      } finally {
        setDraftsLoading(false);
      }
    }

    loadDrafts();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await apiFetch('/api/contracts/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tipoContrato,
          nombreCliente: nombreCliente.trim(),
          descripcionCaso: descripcionCaso.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Tu sesión no es válida para generar contratos.');
        }
        const data = await response.json().catch(() => null);
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(message || 'No se pudo generar el contrato.');
      }

      const data = (await response.json()) as ContractResponse;
      setResult(data);
      setDrafts((currentDrafts) => [data, ...currentDrafts]);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Generador de contrato</h2>
            <p className="text-sm leading-6 text-slate-600">
              Completa los datos base del asunto para generar una respuesta simulada desde la API de LEXIA.
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="tipoContrato" className="block text-sm font-medium text-slate-700">
                Tipo de contrato
              </label>
              <select
                id="tipoContrato"
                value={tipoContrato}
                onChange={(event) => setTipoContrato(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              >
                {contractTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nombreCliente" className="block text-sm font-medium text-slate-700">
                Nombre del cliente
              </label>
              <input
                id="nombreCliente"
                value={nombreCliente}
                onChange={(event) => setNombreCliente(event.target.value)}
                required
                placeholder="Ej. María López Consultores"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="descripcionCaso" className="block text-sm font-medium text-slate-700">
                Descripción del caso
              </label>
              <textarea
                id="descripcionCaso"
                value={descripcionCaso}
                onChange={(event) => setDescripcionCaso(event.target.value)}
                required
                minLength={10}
                rows={6}
                placeholder="Describe el contexto jurídico, alcance del acuerdo y puntos clave a proteger."
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
              />
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Generando contrato...' : 'Generar borrador'}
            </button>
          </form>
        </section>

        <section className="rounded-3xl bg-slate-950 p-6 text-white">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Respuesta API</p>
          <h2 className="text-2xl font-semibold">Resultado generado</h2>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
            Procesando solicitud y preparando cláusulas sugeridas...
          </div>
        ) : null}

        {!loading && !result ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-5 text-sm leading-6 text-slate-400">
            Aquí verás el título del contrato, un resumen ejecutivo y las cláusulas sugeridas devueltas por el backend.
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
              <p className="text-sm text-slate-400">Borrador guardado</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">ID: {result.id}</p>
              <p className="text-sm leading-6 text-slate-300">
                Fecha: {new Date(result.createdAt).toLocaleString('es-MX')}
              </p>
              <p className="text-sm leading-6 text-slate-300">
                Última actualización: {new Date(result.updatedAt).toLocaleString('es-MX')}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
              <p className="text-sm text-slate-400">Título</p>
              <h3 className="mt-2 text-xl font-semibold text-white">{result.titulo}</h3>
            </div>

            <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
              <p className="text-sm text-slate-400">Resumen</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{result.resumen}</p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
              <p className="text-sm text-slate-400">Cláusulas sugeridas</p>
              <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
                {result.clausulasSugeridas.map((clause) => (
                  <li key={clause} className="rounded-xl bg-slate-950/60 px-4 py-3">
                    {clause}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
        </section>
      </div>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Persistencia</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Borradores generados</h2>
          </div>
        </div>

        {draftsLoading ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 ring-1 ring-slate-200">
            Cargando borradores guardados...
          </div>
        ) : null}

        {!draftsLoading && draftsError ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-700 ring-1 ring-red-200">
            {draftsError}
          </div>
        ) : null}

        {!draftsLoading && !draftsError && drafts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
            Aún no hay borradores guardados. Genera el primero desde el formulario superior.
          </div>
        ) : null}

        {!draftsLoading && !draftsError && drafts.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {drafts.map((draft) => (
              <article key={draft.id} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{draft.tipoContrato}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{draft.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-600">Cliente: {draft.nombreCliente}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 text-right text-xs text-slate-500">
                    <div>
                      <p>ID: {draft.id}</p>
                      <p>{new Date(draft.createdAt).toLocaleString('es-MX')}</p>
                    </div>
                    <Link
                      href={`/contratos/${draft.id}`}
                      className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Ver
                    </Link>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{draft.resumen}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}