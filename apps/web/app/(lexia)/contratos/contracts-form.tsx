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

  useEffect(() => {
    async function loadDrafts() {
      setDraftsLoading(true);
      setDraftsError('');

      try {
        const response = await apiFetch('/api/contracts/drafts');

        if (!response.ok) {
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
        body: JSON.stringify({
          tipoContrato,
          nombreCliente: nombreCliente.trim(),
          descripcionCaso: descripcionCaso.trim(),
        }),
      });

      if (!response.ok) {
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
        <section className="rounded-[1rem] border border-slate-700 bg-[#111827] p-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-slate-50">Generador de contrato</h2>
            <p className="text-sm leading-6 text-slate-300">
              Completa los datos base del asunto para generar una respuesta simulada desde la API de la plataforma.
            </p>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="tipoContrato" className="lex-label">
                Tipo de contrato
              </label>
              <select
                id="tipoContrato"
                value={tipoContrato}
                onChange={(event) => setTipoContrato(event.target.value)}
                className="lex-input"
              >
                {contractTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nombreCliente" className="lex-label">
                Nombre del cliente
              </label>
              <input
                id="nombreCliente"
                value={nombreCliente}
                onChange={(event) => setNombreCliente(event.target.value)}
                required
                placeholder="Ej. María López Consultores"
                className="lex-input"
              />
            </div>

            <div>
              <label htmlFor="descripcionCaso" className="lex-label">
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
                className="lex-input"
              />
            </div>

            {error ? <p className="lex-notice-error">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="lex-button-primary disabled:cursor-not-allowed"
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

      <section className="rounded-[1rem] border border-slate-700 bg-[#111827] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Persistencia</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">Borradores generados</h2>
          </div>
        </div>

        {draftsLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 text-sm text-slate-300">
            Cargando borradores guardados...
          </div>
        ) : null}

        {!draftsLoading && draftsError ? (
          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-sm text-red-700 ring-1 ring-red-200">
            {draftsError}
          </div>
        ) : null}

        {!draftsLoading && !draftsError && drafts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">
            Aún no hay borradores guardados. Genera el primero desde el formulario superior.
          </div>
        ) : null}

        {!draftsLoading && !draftsError && drafts.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {drafts.map((draft) => (
              <article key={draft.id} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{draft.tipoContrato}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-50">{draft.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-300">Cliente: {draft.nombreCliente}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 text-right text-xs text-slate-400">
                    <div>
                      <p>ID: {draft.id}</p>
                      <p>{new Date(draft.createdAt).toLocaleString('es-MX')}</p>
                    </div>
                    <Link
                      href={`/contratos/${draft.id}`}
                      className="lex-button-primary px-4 py-2"
                    >
                      Ver
                    </Link>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">{draft.resumen}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}