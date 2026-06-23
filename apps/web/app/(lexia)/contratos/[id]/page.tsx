'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { featureModules } from '../../feature-data';
import { FeatureShell } from '../../feature-shell';
import { apiFetch } from '../../../lib/api';

type ContractDraft = {
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

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;

    if (Array.isArray(message)) {
      return message[0] ?? fallback;
    }

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export default function ContractDraftDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const draftId = useMemo(() => {
    const rawId = params?.id;
    return Array.isArray(rawId) ? rawId[0] : rawId;
  }, [params]);

  const [draft, setDraft] = useState<ContractDraft | null>(null);
  const [tipoContrato, setTipoContrato] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [descripcionCaso, setDescripcionCaso] = useState('');
  const [titulo, setTitulo] = useState('');
  const [resumen, setResumen] = useState('');
  const [clausulasTexto, setClausulasTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  function getAuthHeaders() {
    const accessToken =
      typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;

    if (!accessToken) {
      router.push('/login');
      throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  function syncFormState(nextDraft: ContractDraft) {
    setDraft(nextDraft);
    setTipoContrato(nextDraft.tipoContrato);
    setNombreCliente(nextDraft.nombreCliente);
    setDescripcionCaso(nextDraft.descripcionCaso);
    setTitulo(nextDraft.titulo);
    setResumen(nextDraft.resumen);
    setClausulasTexto(nextDraft.clausulasSugeridas.join('\n'));
  }

  useEffect(() => {
    if (!draftId) {
      setError('No se encontró el identificador del borrador.');
      setLoading(false);
      return;
    }

    async function loadDraft() {
      setLoading(true);
      setError('');

      try {
        const response = await apiFetch(`/api/contracts/drafts/${draftId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error('Tu sesión no es válida para ver este borrador.');
          }
          const data = await response.json().catch(() => null);
          throw new Error(getErrorMessage(data, 'No se pudo cargar el borrador solicitado.'));
        }

        const data = (await response.json()) as ContractDraft;
        syncFormState(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el borrador.');
      } finally {
        setLoading(false);
      }
    }

    loadDraft();
  }, [draftId]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draftId) {
      setError('No se encontró el identificador del borrador.');
      return;
    }

    setSaveLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiFetch(`/api/contracts/drafts/${draftId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          tipoContrato: tipoContrato.trim(),
          nombreCliente: nombreCliente.trim(),
          descripcionCaso: descripcionCaso.trim(),
          titulo: titulo.trim(),
          resumen: resumen.trim(),
          clausulasSugeridas: clausulasTexto
            .split('\n')
            .map((clause) => clause.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Tu sesión no es válida para editar este borrador.');
        }
        const data = await response.json().catch(() => null);
        throw new Error(getErrorMessage(data, 'No se pudo guardar el borrador.'));
      }

      const data = (await response.json()) as ContractDraft;
      syncFormState(data);
      setSuccessMessage('Borrador actualizado correctamente.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el borrador.');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleRegenerate() {
    if (!draftId) {
      setError('No se encontró el identificador del borrador.');
      return;
    }

    setRegenerateLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await apiFetch(`/api/contracts/drafts/${draftId}/regenerate`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Tu sesión no es válida para regenerar este borrador.');
        }
        const data = await response.json().catch(() => null);
        throw new Error(getErrorMessage(data, 'No se pudo regenerar el borrador.'));
      }

      const data = (await response.json()) as ContractDraft;
      syncFormState(data);
      setSuccessMessage('Borrador regenerado correctamente.');
    } catch (regenerateError) {
      setError(regenerateError instanceof Error ? regenerateError.message : 'No se pudo regenerar el borrador.');
    } finally {
      setRegenerateLoading(false);
    }
  }

  return (
    <FeatureShell module={featureModules.contratos}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Detalle del borrador</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Editar contrato generado</h2>
          </div>
          <Link
            href="/contratos"
            className="inline-flex rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Volver a contratos
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-600 ring-1 ring-slate-200">
            Cargando borrador seleccionado...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-3xl bg-red-50 p-6 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        ) : null}

        {!loading && !error && draft ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-900">Campos editables</h3>
                <p className="text-sm leading-6 text-slate-600">
                  Ajusta el contenido del borrador y guarda los cambios o solicita una nueva regeneración simulada.
                </p>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSave}>
                <div>
                  <label htmlFor="tipoContrato" className="block text-sm font-medium text-slate-700">
                    Tipo de contrato
                  </label>
                  <input
                    id="tipoContrato"
                    value={tipoContrato}
                    onChange={(event) => setTipoContrato(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
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
                    rows={5}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-slate-700">
                    Título
                  </label>
                  <input
                    id="titulo"
                    value={titulo}
                    onChange={(event) => setTitulo(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="resumen" className="block text-sm font-medium text-slate-700">
                    Resumen
                  </label>
                  <textarea
                    id="resumen"
                    value={resumen}
                    onChange={(event) => setResumen(event.target.value)}
                    required
                    rows={6}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="clausulasSugeridas" className="block text-sm font-medium text-slate-700">
                    Cláusulas sugeridas
                  </label>
                  <textarea
                    id="clausulasSugeridas"
                    value={clausulasTexto}
                    onChange={(event) => setClausulasTexto(event.target.value)}
                    required
                    rows={8}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:border-slate-900 focus:outline-none"
                  />
                  <p className="mt-2 text-xs text-slate-500">Escribe una cláusula por línea para mantener el formato de lista.</p>
                </div>

                {successMessage ? <p className="text-sm font-medium text-green-700">{successMessage}</p> : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saveLoading || regenerateLoading}
                    className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {saveLoading ? 'Guardando cambios...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={saveLoading || regenerateLoading}
                    className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {regenerateLoading ? 'Regenerando...' : 'Regenerar borrador'}
                  </button>
                </div>
              </form>
            </section>

            <section className="rounded-3xl bg-slate-950 p-6 text-white">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Vista actual</p>
                <h3 className="text-2xl font-semibold">Resumen del borrador</h3>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
                  <p className="text-sm text-slate-400">Metadatos</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">ID: {draft.id}</p>
                  <p className="text-sm leading-6 text-slate-300">Fecha: {new Date(draft.createdAt).toLocaleString('es-MX')}</p>
                  <p className="text-sm leading-6 text-slate-300">
                    Última actualización: {new Date(draft.updatedAt).toLocaleString('es-MX')}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
                  <p className="text-sm text-slate-400">Título</p>
                  <h4 className="mt-2 text-xl font-semibold text-white">{draft.titulo}</h4>
                  <p className="mt-3 text-sm leading-6 text-slate-300">Cliente: {draft.nombreCliente}</p>
                  <p className="text-sm leading-6 text-slate-300">Tipo: {draft.tipoContrato}</p>
                </div>

                <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
                  <p className="text-sm text-slate-400">Resumen</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{draft.resumen}</p>
                </div>

                <div className="rounded-2xl bg-slate-900/70 p-5 ring-1 ring-slate-800">
                  <p className="text-sm text-slate-400">Cláusulas sugeridas</p>
                  <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-200">
                    {draft.clausulasSugeridas.map((clause) => (
                      <li key={clause} className="rounded-xl bg-slate-950/60 px-4 py-3">
                        {clause}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </FeatureShell>
  );
}