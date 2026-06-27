'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiFetch, getAuthHeaders as getSessionAuthHeaders, IA_JURIDICA_API_PREFIX } from '../../lib/api';

type DocumentoOption = {
  id: string;
  nombreArchivo: string;
  tipoDocumento: string;
};

type ExpedienteOption = {
  id: string;
  titulo: string;
};

type ClienteOption = {
  id: string;
  nombre: string;
};

type ConversationMessage = {
  id: string;
  preguntaUsuario: string;
  respuestaIa: string;
  modo: 'openai' | 'local';
  contextoJuridico: string;
  analisis: string;
  recomendaciones: string[];
  riesgos: string[];
  proyeccionCaso: string;
  createdAt: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  contextoJuridico: string;
  clienteId: string | null;
  expedienteId: string | null;
  messagesCount: number;
  latestMessage: ConversationMessage | null;
  updatedAt: string;
};

type ConversationDetail = ConversationSummary & {
  messages: ConversationMessage[];
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
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [metaError, setMetaError] = useState('');

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [conversationError, setConversationError] = useState('');

  const [creatingConversation, setCreatingConversation] = useState(false);
  const [createConversationError, setCreateConversationError] = useState('');
  const [createConversationForm, setCreateConversationForm] = useState({
    title: '',
    contextoJuridico: 'general',
    clienteId: '',
    expedienteId: '',
  });

  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [messageForm, setMessageForm] = useState({
    pregunta: '',
    contextoJuridico: 'general',
  });

  const [associating, setAssociating] = useState(false);
  const [associateError, setAssociateError] = useState('');
  const [associateForm, setAssociateForm] = useState({
    clienteId: '',
    expedienteId: '',
  });

  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');
  const [assistantResult, setAssistantResult] = useState<{
    modo: 'openai' | 'local';
    respuesta: string;
    accionesSugeridas: string[];
  } | null>(null);
  const [assistantForm, setAssistantForm] = useState({
    consulta: '',
    contexto: 'general',
    detalle: '',
  });

  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    modo: 'openai' | 'local';
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
  const [draftResult, setDraftResult] = useState<{ modo: 'openai' | 'local'; tipoBorrador: string; borrador: string } | null>(null);
  const [draftForm, setDraftForm] = useState({
    tipoBorrador: 'Demanda civil',
    hechos: '',
    objetivo: '',
  });

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');
  const [summaryResult, setSummaryResult] = useState<{
    modo: 'openai' | 'local';
    expedienteId: string;
    resumen: string;
    puntosClave: string[];
  } | null>(null);
  const [summaryExpedienteId, setSummaryExpedienteId] = useState('');

  async function getAuthHeaders() {
    return getSessionAuthHeaders();
  }

  async function loadConversations(selectConversationId?: string) {
    setLoadingConversations(true);
    setConversationError('');

    try {
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/conversations`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar las conversaciones IA.'));
      }

      const data = (await response.json()) as ConversationSummary[];
      setConversations(data);

      const preferredId = selectConversationId ?? selectedConversation?.id;
      if (preferredId) {
        const detailResponse = await apiFetch(`${IA_JURIDICA_API_PREFIX}/conversations/${preferredId}`, {
          headers: await getAuthHeaders(),
        });

        if (detailResponse.ok) {
          const detail = (await detailResponse.json()) as ConversationDetail;
          setSelectedConversation(detail);
          setAssociateForm({
            clienteId: detail.clienteId ?? '',
            expedienteId: detail.expedienteId ?? '',
          });
          setMessageForm((current) => ({ ...current, contextoJuridico: detail.contextoJuridico || current.contextoJuridico }));
        }
      }
    } catch (loadError) {
      setConversationError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las conversaciones IA.');
    } finally {
      setLoadingConversations(false);
    }
  }

  useEffect(() => {
    async function loadMeta() {
      setLoadingMeta(true);
      setMetaError('');

      try {
        const [docsResponse, expResponse, clientesResponse] = await Promise.all([
          apiFetch('/api/documentos', { headers: await getAuthHeaders() }),
          apiFetch('/api/expedientes', { headers: await getAuthHeaders() }),
          apiFetch('/api/clientes', { headers: await getAuthHeaders() }),
        ]);

        if (!docsResponse.ok) {
          const data = await docsResponse.json().catch(() => null);
          throw new Error(parseApiError(data, 'No se pudieron cargar los documentos.'));
        }

        if (!expResponse.ok) {
          const data = await expResponse.json().catch(() => null);
          throw new Error(parseApiError(data, 'No se pudieron cargar los expedientes.'));
        }

        if (!clientesResponse.ok) {
          const data = await clientesResponse.json().catch(() => null);
          throw new Error(parseApiError(data, 'No se pudieron cargar los clientes.'));
        }

        const docsData = (await docsResponse.json()) as DocumentoOption[];
        const expData = (await expResponse.json()) as ExpedienteOption[];
        const clientesData = (await clientesResponse.json()) as ClienteOption[];
        setDocumentos(docsData);
        setExpedientes(expData);
        setClientes(clientesData);
      } catch (loadError) {
        setMetaError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información base.');
      } finally {
        setLoadingMeta(false);
      }
    }

    loadMeta();
    loadConversations();
  }, []);

  async function handleCreateConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreatingConversation(true);
    setCreateConversationError('');

    try {
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/conversations`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          title: createConversationForm.title.trim() || undefined,
          contextoJuridico: createConversationForm.contextoJuridico,
          clienteId: createConversationForm.clienteId || undefined,
          expedienteId: createConversationForm.expedienteId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo crear la conversación IA.'));
      }

      const detail = (await response.json()) as ConversationDetail;
      setSelectedConversation(detail);
      setAssociateForm({
        clienteId: detail.clienteId ?? '',
        expedienteId: detail.expedienteId ?? '',
      });
      setMessageForm((current) => ({ ...current, contextoJuridico: detail.contextoJuridico || current.contextoJuridico }));
      setCreateConversationForm({
        title: '',
        contextoJuridico: createConversationForm.contextoJuridico,
        clienteId: createConversationForm.clienteId,
        expedienteId: createConversationForm.expedienteId,
      });
      await loadConversations(detail.id);
    } catch (requestError) {
      setCreateConversationError(requestError instanceof Error ? requestError.message : 'No se pudo crear la conversación IA.');
    } finally {
      setCreatingConversation(false);
    }
  }

  async function selectConversation(conversationId: string) {
    setConversationError('');

    try {
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/conversations/${conversationId}`, {
        headers: await getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo cargar la conversación seleccionada.'));
      }

      const detail = (await response.json()) as ConversationDetail;
      setSelectedConversation(detail);
      setAssociateForm({
        clienteId: detail.clienteId ?? '',
        expedienteId: detail.expedienteId ?? '',
      });
      setMessageForm((current) => ({ ...current, contextoJuridico: detail.contextoJuridico || current.contextoJuridico }));
    } catch (requestError) {
      setConversationError(requestError instanceof Error ? requestError.message : 'No se pudo cargar la conversación seleccionada.');
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversation) {
      setMessageError('Selecciona una conversación antes de enviar mensajes.');
      return;
    }

    setSendingMessage(true);
    setMessageError('');

    try {
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          pregunta: messageForm.pregunta.trim(),
          contextoJuridico: messageForm.contextoJuridico,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo enviar el mensaje a la conversación IA.'));
      }

      const detail = (await response.json()) as ConversationDetail;
      setSelectedConversation(detail);
      setMessageForm((current) => ({ ...current, pregunta: '' }));
      await loadConversations(detail.id);
    } catch (requestError) {
      setMessageError(requestError instanceof Error ? requestError.message : 'No se pudo enviar el mensaje a la conversación IA.');
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleAssociateConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedConversation) {
      setAssociateError('Selecciona una conversación antes de asociarla.');
      return;
    }

    setAssociating(true);
    setAssociateError('');

    try {
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/conversations/${selectedConversation.id}/associations`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          clienteId: associateForm.clienteId || undefined,
          expedienteId: associateForm.expedienteId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo asociar la conversación IA.'));
      }

      const detail = (await response.json()) as ConversationDetail;
      setSelectedConversation(detail);
      await loadConversations(detail.id);
    } catch (requestError) {
      setAssociateError(requestError instanceof Error ? requestError.message : 'No se pudo asociar la conversación IA.');
    } finally {
      setAssociating(false);
    }
  }

  async function handleAssistant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAssistantLoading(true);
    setAssistantError('');
    setAssistantResult(null);

    try {
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/consultar`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          consulta: assistantForm.consulta.trim(),
          contexto: assistantForm.contexto,
          detalle: assistantForm.detalle.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo consultar al asistente virtual.'));
      }

      setAssistantResult(
        (await response.json()) as {
          modo: 'openai' | 'local';
          respuesta: string;
          accionesSugeridas: string[];
        },
      );
    } catch (requestError) {
      setAssistantError(requestError instanceof Error ? requestError.message : 'No se pudo consultar al asistente virtual.');
    } finally {
      setAssistantLoading(false);
    }
  }

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

      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/analizar-documento`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo analizar el documento.'));
      }

      setAnalysisResult(
        (await response.json()) as {
          modo: 'openai' | 'local';
          analisis: string;
          resumenRiesgos: string;
          recomendaciones: string[];
        },
      );
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
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/generar-borrador`, {
        method: 'POST',
        headers: await getAuthHeaders(),
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

      setDraftResult((await response.json()) as { modo: 'openai' | 'local'; tipoBorrador: string; borrador: string });
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
      const response = await apiFetch(`${IA_JURIDICA_API_PREFIX}/resumen-expediente`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ expedienteId: summaryExpedienteId || undefined }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo resumir el expediente.'));
      }

      setSummaryResult(
        (await response.json()) as {
          modo: 'openai' | 'local';
          expedienteId: string;
          resumen: string;
          puntosClave: string[];
        },
      );
    } catch (requestError) {
      setSummaryError(requestError instanceof Error ? requestError.message : 'No se pudo resumir el expediente.');
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {loadingMeta ? <p className="text-sm text-slate-300">Cargando documentos y expedientes...</p> : null}
      {metaError ? <p className="text-sm text-red-300">{metaError}</p> : null}

      <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-50">Asistente virtual jurídico</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Consulta estrategia, riesgos, cumplimiento o próximos pasos y convierte la respuesta en una acción operativa.
            </p>
          </div>
          <div className="rounded-full border border-blue-700/40 bg-blue-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
            IA conversacional
          </div>
        </div>
        {assistantResult?.modo === 'local' ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            El backend está funcionando en modo local porque falta <span className="font-semibold">OPENAI_API_KEY</span> o la API respondió sin contenido.
          </p>
        ) : null}

        <div className="mt-5 grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Nueva conversación</h3>
            <form onSubmit={handleCreateConversation} className="space-y-3">
              <input
                value={createConversationForm.title}
                onChange={(event) => setCreateConversationForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Título de la conversación"
                className="lex-input mt-0"
              />
              <select
                value={createConversationForm.contextoJuridico}
                onChange={(event) => setCreateConversationForm((current) => ({ ...current, contextoJuridico: event.target.value }))}
                className="lex-input mt-0"
              >
                <option value="general">General</option>
                <option value="estrategia">Estrategia</option>
                <option value="expediente">Expediente</option>
                <option value="contrato">Contrato</option>
                <option value="cumplimiento">Cumplimiento</option>
              </select>
              <select
                value={createConversationForm.clienteId}
                onChange={(event) => setCreateConversationForm((current) => ({ ...current, clienteId: event.target.value }))}
                className="lex-input mt-0"
              >
                <option value="">Sin cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
              <select
                value={createConversationForm.expedienteId}
                onChange={(event) => setCreateConversationForm((current) => ({ ...current, expedienteId: event.target.value }))}
                className="lex-input mt-0"
              >
                <option value="">Sin expediente</option>
                {expedientes.map((expediente) => (
                  <option key={expediente.id} value={expediente.id}>
                    {expediente.titulo}
                  </option>
                ))}
              </select>
              {createConversationError ? <p className="text-sm text-red-300">{createConversationError}</p> : null}
              <button type="submit" disabled={creatingConversation} className="lex-button-primary w-full">
                {creatingConversation ? 'Creando...' : 'Crear conversación'}
              </button>
            </form>

            <div className="space-y-2 border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Historial IA</h3>
                <button
                  type="button"
                  onClick={() => loadConversations()}
                  className="rounded-lg border border-slate-600 px-2 py-1 text-xs text-slate-200"
                >
                  Refrescar
                </button>
              </div>
              {loadingConversations ? <p className="text-xs text-slate-300">Cargando conversaciones...</p> : null}
              {conversationError ? <p className="text-xs text-red-300">{conversationError}</p> : null}
              <div className="max-h-64 space-y-2 overflow-auto pr-1">
                {conversations.length === 0 ? <p className="text-xs text-slate-500">Sin conversaciones registradas.</p> : null}
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className={`w-full rounded-lg border p-3 text-left ${
                      selectedConversation?.id === conversation.id
                        ? 'border-blue-600 bg-blue-900/20'
                        : 'border-slate-700 bg-slate-900/70'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-100">{conversation.title}</p>
                    <p className="mt-1 text-xs text-slate-300">Contexto: {conversation.contextoJuridico}</p>
                    <p className="text-xs text-slate-400">Mensajes: {conversation.messagesCount}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <h3 className="text-lg font-semibold text-slate-50">
              {selectedConversation ? `Conversación activa: ${selectedConversation.title}` : 'Selecciona o crea una conversación'}
            </h3>

            <form onSubmit={handleAssociateConversation} className="grid gap-3 border-b border-slate-700 pb-4 sm:grid-cols-3">
              <select
                value={associateForm.clienteId}
                onChange={(event) => setAssociateForm((current) => ({ ...current, clienteId: event.target.value }))}
                className="lex-input mt-0"
                disabled={!selectedConversation}
              >
                <option value="">Sin cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
              <select
                value={associateForm.expedienteId}
                onChange={(event) => setAssociateForm((current) => ({ ...current, expedienteId: event.target.value }))}
                className="lex-input mt-0"
                disabled={!selectedConversation}
              >
                <option value="">Sin expediente</option>
                {expedientes.map((expediente) => (
                  <option key={expediente.id} value={expediente.id}>
                    {expediente.titulo}
                  </option>
                ))}
              </select>
              <button type="submit" disabled={!selectedConversation || associating} className="lex-button-secondary">
                {associating ? 'Asociando...' : 'Asociar conversación'}
              </button>
              {associateError ? <p className="text-sm text-red-300 sm:col-span-3">{associateError}</p> : null}
            </form>

            <div className="max-h-[22rem] space-y-3 overflow-auto rounded-lg border border-slate-700 bg-slate-950/50 p-3">
              {selectedConversation?.messages?.length ? (
                selectedConversation.messages.map((message) => (
                  <article key={message.id} className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {message.contextoJuridico} · {message.modo === 'openai' ? 'OpenAI' : 'Local'}
                    </p>
                    <p className="text-sm text-slate-100">Pregunta: {message.preguntaUsuario}</p>
                    <p className="whitespace-pre-line text-sm text-slate-200">{message.respuestaIa}</p>
                    <p className="text-xs text-amber-300">Riesgos: {message.riesgos.join(' | ')}</p>
                    <p className="text-xs text-emerald-300">Proyección: {message.proyeccionCaso}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-400">Aún no hay mensajes en esta conversación.</p>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <select
                value={messageForm.contextoJuridico}
                onChange={(event) => setMessageForm((current) => ({ ...current, contextoJuridico: event.target.value }))}
                className="lex-input mt-0"
                disabled={!selectedConversation}
              >
                <option value="general">General</option>
                <option value="estrategia">Estrategia</option>
                <option value="expediente">Expediente</option>
                <option value="contrato">Contrato</option>
                <option value="cumplimiento">Cumplimiento</option>
              </select>
              <textarea
                value={messageForm.pregunta}
                onChange={(event) => setMessageForm((current) => ({ ...current, pregunta: event.target.value }))}
                placeholder="Escribe tu consulta para continuar la conversación IA"
                rows={4}
                className="lex-input mt-0"
                required
                disabled={!selectedConversation}
              />
              {messageError ? <p className="text-sm text-red-300">{messageError}</p> : null}
              <button type="submit" disabled={!selectedConversation || sendingMessage} className="lex-button-primary">
                {sendingMessage ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          </div>
        </div>

        <form onSubmit={handleAssistant} className="mt-5 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-4">
            <select
              value={assistantForm.contexto}
              onChange={(event) => setAssistantForm((current) => ({ ...current, contexto: event.target.value }))}
              className="lex-input mt-0"
            >
              <option value="general">Consulta general</option>
              <option value="contrato">Contrato</option>
              <option value="expediente">Expediente</option>
              <option value="estrategia">Estrategia</option>
              <option value="cumplimiento">Cumplimiento</option>
            </select>
            <textarea
              value={assistantForm.detalle}
              onChange={(event) => setAssistantForm((current) => ({ ...current, detalle: event.target.value }))}
              placeholder="Detalle adicional opcional"
              rows={6}
              className="lex-input mt-0"
            />
          </div>

          <div className="space-y-4">
            <textarea
              value={assistantForm.consulta}
              onChange={(event) => setAssistantForm((current) => ({ ...current, consulta: event.target.value }))}
              placeholder="Ejemplo: necesito una estrategia inicial para responder a un incumplimiento contractual con riesgo de penalidad."
              rows={8}
              className="lex-input mt-0"
              required
            />
            {assistantError ? <p className="text-sm text-red-300">{assistantError}</p> : null}
            <button type="submit" disabled={assistantLoading} className="lex-button-primary">
              {assistantLoading ? 'Consultando...' : 'Consultar asistente virtual'}
            </button>
          </div>
        </form>

        {assistantResult ? (
          <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-50">Respuesta del asistente</p>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                Modo: {assistantResult.modo === 'openai' ? 'OpenAI' : 'Local'}
              </span>
            </div>
            <p className="whitespace-pre-line rounded-lg border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-200">{assistantResult.respuesta}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              {assistantResult.accionesSugeridas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">Analizar documento</h2>
          <form onSubmit={handleAnalyze} className="mt-4 space-y-4">
            <select
              value={analysisForm.documentoId}
              onChange={(event) => setAnalysisForm((current) => ({ ...current, documentoId: event.target.value }))}
              className="lex-input mt-0"
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
              className="lex-input mt-0"
            />
            <input
              value={analysisForm.pregunta}
              onChange={(event) => setAnalysisForm((current) => ({ ...current, pregunta: event.target.value }))}
              placeholder="Pregunta guía (opcional)"
              className="lex-input mt-0"
            />
            {analysisError ? <p className="text-sm text-red-300">{analysisError}</p> : null}
            <button type="submit" disabled={analysisLoading} className="lex-button-primary">
              {analysisLoading ? 'Analizando...' : 'Analizar documento'}
            </button>
          </form>
          {analysisResult ? (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-50">Resultado del análisis</p>
                <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                  Modo: {analysisResult.modo === 'openai' ? 'OpenAI' : 'Local'}
                </span>
              </div>
              <p className="whitespace-pre-line rounded-lg border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-200">{analysisResult.analisis}</p>
              <p className="text-sm text-slate-300">Riesgos: {analysisResult.resumenRiesgos}</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                {analysisResult.recomendaciones.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">Generar borrador legal</h2>
          <form onSubmit={handleGenerateDraft} className="mt-4 space-y-4">
            <input
              value={draftForm.tipoBorrador}
              onChange={(event) => setDraftForm((current) => ({ ...current, tipoBorrador: event.target.value }))}
              placeholder="Tipo de borrador"
              className="lex-input mt-0"
              required
            />
            <textarea
              value={draftForm.hechos}
              onChange={(event) => setDraftForm((current) => ({ ...current, hechos: event.target.value }))}
              placeholder="Hechos relevantes"
              rows={4}
              className="lex-input mt-0"
              required
            />
            <textarea
              value={draftForm.objetivo}
              onChange={(event) => setDraftForm((current) => ({ ...current, objetivo: event.target.value }))}
              placeholder="Objetivo jurídico"
              rows={3}
              className="lex-input mt-0"
              required
            />
            {draftError ? <p className="text-sm text-red-300">{draftError}</p> : null}
            <button type="submit" disabled={draftLoading} className="lex-button-primary">
              {draftLoading ? 'Generando...' : 'Generar borrador'}
            </button>
          </form>
          {draftResult ? (
            <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-50">{draftResult.tipoBorrador}</p>
                <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                  Modo: {draftResult.modo === 'openai' ? 'OpenAI' : 'Local'}
                </span>
              </div>
              <p className="whitespace-pre-line rounded-lg border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-200">{draftResult.borrador}</p>
            </div>
          ) : null}
        </section>
      </div>

      <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
        <h2 className="text-xl font-semibold text-slate-50">Resumir expediente</h2>
        <form onSubmit={handleSummary} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={summaryExpedienteId}
            onChange={(event) => setSummaryExpedienteId(event.target.value)}
            className="lex-input mt-0 w-full sm:max-w-md"
            required
          >
            <option value="">Selecciona expediente</option>
            {expedientes.map((expediente) => (
              <option key={expediente.id} value={expediente.id}>
                {expediente.titulo}
              </option>
            ))}
          </select>
          <button type="submit" disabled={summaryLoading} className="lex-button-primary">
            {summaryLoading ? 'Resumiendo...' : 'Resumir expediente'}
          </button>
        </form>

        {summaryError ? <p className="mt-3 text-sm text-red-300">{summaryError}</p> : null}

        {summaryResult ? (
          <div className="mt-4 space-y-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-50">Resumen ejecutivo</p>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                Modo: {summaryResult.modo === 'openai' ? 'OpenAI' : 'Local'}
              </span>
            </div>
            <p className="whitespace-pre-line rounded-lg border border-slate-700 bg-slate-800/70 p-3 text-sm text-slate-200">{summaryResult.resumen}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
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
