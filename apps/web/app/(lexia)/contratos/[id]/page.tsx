'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
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
        const response = await apiFetch(`/api/contracts/drafts/${draftId}`);

        if (!response.ok) {
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
      });

      if (!response.ok) {
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Detalle del borrador</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">Editar contrato generado</h2>
          </div>
          <Link
            href="/contratos"
            className="lex-button-secondary"
          >
            Volver a contratos
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[1rem] border border-slate-700 bg-slate-900/60 p-6 text-sm text-slate-300">
            Cargando borrador seleccionado...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-3xl bg-red-50 p-6 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        ) : null}

        {!loading && !error && draft ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="rounded-[1rem] border border-slate-700 bg-[#111827] p-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-slate-50">Campos editables</h3>
                <p className="text-sm leading-6 text-slate-300">
                  Ajusta el contenido del borrador y guarda los cambios o solicita una nueva regeneración simulada.
                </p>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSave}>
                <div>
                  <label htmlFor="tipoContrato" className="lex-label">
                    Tipo de contrato
                  </label>
                  <input
                    id="tipoContrato"
                    value={tipoContrato}
                    onChange={(event) => setTipoContrato(event.target.value)}
                    required
                    className="lex-input"
                  />
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
                    rows={5}
                    className="lex-input"
                  />
                </div>

                <div>
                  <label htmlFor="titulo" className="lex-label">
                    Título
                  </label>
                  <input
                    id="titulo"
                    value={titulo}
                    onChange={(event) => setTitulo(event.target.value)}
                    required
                    className="lex-input"
                  />
                </div>

                <div>
                  <label htmlFor="resumen" className="lex-label">
                    Resumen
                  </label>
                  <textarea
                    id="resumen"
                    value={resumen}
                    onChange={(event) => setResumen(event.target.value)}
                    required
                    rows={6}
                    className="lex-input"
                  />
                </div>

                <div>
                  <label htmlFor="clausulasSugeridas" className="lex-label">
                    Cláusulas sugeridas
                  </label>
                  <textarea
                    id="clausulasSugeridas"
                    value={clausulasTexto}
                    onChange={(event) => setClausulasTexto(event.target.value)}
                    required
                    rows={8}
                    className="lex-input"
                  />
                  <p className="mt-2 text-xs text-slate-400">Escribe una cláusula por línea para mantener el formato de lista.</p>
                </div>

                {successMessage ? <p className="lex-notice-success">{successMessage}</p> : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={saveLoading || regenerateLoading}
                    className="lex-button-primary"
                  >
                    {saveLoading ? 'Guardando cambios...' : 'Guardar cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={saveLoading || regenerateLoading}
                    className="lex-button-secondary"
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