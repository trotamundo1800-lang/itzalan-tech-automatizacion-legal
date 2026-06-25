import type {
  ActivityLog,
  AgendaEvent,
  Client,
  DashboardSnapshot,
  DocumentTemplate,
  LegalDocument,
  Expediente,
  ExpedienteStatus,
  IaConsultation,
  PaymentPlan,
  UserProfile,
} from '../types';
import { hasSupabaseConfig } from '../services/supabase/client';
import {
  activatePlanInSupabase,
  createAgendaEventInSupabase,
  createClientInSupabase,
  createDocumentInSupabase,
  createExpedienteInSupabase,
  deleteClientInSupabase,
  deleteExpedienteInSupabase,
  getActivePlanFromSupabase,
  getAgendaEventsFromSupabase,
  getClientsFromSupabase,
  getDashboardSnapshotFromSupabase,
  getDocumentsFromSupabase,
  getExpedientesFromSupabase,
  getIaConsultationsFromSupabase,
  getPlansFromSupabase,
  getProfileFromSupabase,
  saveIaConsultationInSupabase,
  toggleAgendaEventInSupabase,
  updateClientInSupabase,
  updateExpedienteInSupabase,
  updateProfileInSupabase,
} from '../services/supabase/database';

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function nextInternalNumber(): string {
  const seq = expedientes.length + 1;
  return `EXP-${String(seq).padStart(4, '0')}`;
}

let profile: UserProfile = {
  nombre: 'Andrea Pineda',
  correo: 'andrea@despacholexia.hn',
  telefono: '+504 9999-1234',
  tipoUsuario: 'abogado',
  despacho: 'LEXIA Legal IA',
};

let clients: Client[] = [
  {
    id: uid('cli'),
    nombreCompleto: 'María Fernanda López',
    dniOrRtn: '0801-1992-12345',
    telefono: '+504 9876-1111',
    correo: 'maria.lopez@email.com',
    direccion: 'Tegucigalpa, Francisco Morazán',
    tipoCliente: 'persona',
    notas: 'Caso laboral en etapa conciliatoria.',
    createdAt: nowIso(),
  },
  {
    id: uid('cli'),
    nombreCompleto: 'Inversiones Valle Azul S. de R.L.',
    dniOrRtn: '08019012998877',
    telefono: '+504 2234-7788',
    correo: 'legal@valleazul.hn',
    direccion: 'San Pedro Sula, Cortés',
    tipoCliente: 'empresa',
    notas: 'Revisión de contratos mercantiles.',
    createdAt: nowIso(),
  },
  {
    id: uid('cli'),
    nombreCompleto: 'José Manuel Duarte',
    dniOrRtn: '0801-1985-54321',
    telefono: '+504 9456-2200',
    correo: 'jduarte@email.com',
    direccion: 'La Ceiba, Atlántida',
    tipoCliente: 'persona',
    notas: 'Asesoría civil por incumplimiento contractual.',
    createdAt: nowIso(),
  },
];

let expedientes: Expediente[] = [
  {
    id: uid('exp'),
    numeroInterno: 'EXP-0001',
    clienteId: clients[0].id,
    tipoCaso: 'Laboral',
    estado: 'en-curso',
    juzgadoInstitucion: 'Juzgado de Letras del Trabajo',
    fechaInicio: '2026-04-10',
    proximaAudiencia: '2026-07-02',
    notas: 'Pendiente audiencia de conciliación.',
    createdAt: nowIso(),
  },
  {
    id: uid('exp'),
    numeroInterno: 'EXP-0002',
    clienteId: clients[1].id,
    tipoCaso: 'Mercantil',
    estado: 'abierto',
    juzgadoInstitucion: 'Cámara de Comercio de Cortés',
    fechaInicio: '2026-05-22',
    proximaAudiencia: '2026-07-12',
    notas: 'Contrato de suministro en revisión.',
    createdAt: nowIso(),
  },
  {
    id: uid('exp'),
    numeroInterno: 'EXP-0003',
    clienteId: clients[2].id,
    tipoCaso: 'Civil',
    estado: 'en-curso',
    juzgadoInstitucion: 'Juzgado de Letras Civil',
    fechaInicio: '2026-03-01',
    proximaAudiencia: '2026-06-29',
    notas: 'Demanda principal presentada.',
    createdAt: nowIso(),
  },
];

let documents = [
  {
    id: uid('doc'),
    template: 'Contrato de servicios profesionales' as DocumentTemplate,
    titulo: 'Contrato de asesoría corporativa - Valle Azul',
    contenido: 'Documento demo de servicios profesionales.',
    expedienteId: expedientes[1].id,
    createdAt: nowIso(),
  },
  {
    id: uid('doc'),
    template: 'Carta de poder' as DocumentTemplate,
    titulo: 'Carta de poder - Caso Laboral',
    contenido: 'Documento demo de carta de poder.',
    expedienteId: expedientes[0].id,
    createdAt: nowIso(),
  },
  {
    id: uid('doc'),
    template: 'Carta de cobro' as DocumentTemplate,
    titulo: 'Requerimiento de pago pre-judicial',
    contenido: 'Documento demo de carta de cobro.',
    createdAt: nowIso(),
  },
  {
    id: uid('doc'),
    template: 'Dictamen legal' as DocumentTemplate,
    titulo: 'Dictamen mercantil de cumplimiento',
    contenido: 'Documento demo de dictamen.',
    expedienteId: expedientes[1].id,
    createdAt: nowIso(),
  },
  {
    id: uid('doc'),
    template: 'Presupuesto legal' as DocumentTemplate,
    titulo: 'Propuesta de honorarios trimestral',
    contenido: 'Documento demo de presupuesto legal.',
    createdAt: nowIso(),
  },
];

let agendaEvents: AgendaEvent[] = [
  {
    id: uid('ag'),
    titulo: 'Audiencia conciliatoria - López',
    fecha: '2026-07-02',
    hora: '09:00',
    tipoEvento: 'audiencia',
    clienteId: clients[0].id,
    expedienteId: expedientes[0].id,
    estado: 'pendiente',
  },
  {
    id: uid('ag'),
    titulo: 'Reunión de estrategia corporativa',
    fecha: '2026-07-05',
    hora: '14:00',
    tipoEvento: 'reunion',
    clienteId: clients[1].id,
    expedienteId: expedientes[1].id,
    estado: 'pendiente',
  },
  {
    id: uid('ag'),
    titulo: 'Vencimiento plazo de contestación',
    fecha: '2026-06-28',
    hora: '11:30',
    tipoEvento: 'vencimiento',
    clienteId: clients[2].id,
    expedienteId: expedientes[2].id,
    estado: 'pendiente',
  },
];

let plans: PaymentPlan[] = [
  {
    id: uid('plan'),
    nombre: 'Básico',
    precioMensual: 800,
    estadoPago: 'al-dia',
    fechaVencimiento: '2026-07-20',
    activo: false,
  },
  {
    id: uid('plan'),
    nombre: 'Profesional',
    precioMensual: 1500,
    estadoPago: 'pendiente',
    fechaVencimiento: '2026-06-26',
    activo: true,
  },
  {
    id: uid('plan'),
    nombre: 'Corporativo',
    precioMensual: 3500,
    estadoPago: 'vencido',
    fechaVencimiento: '2026-06-15',
    activo: false,
  },
];

let iaConsultations: IaConsultation[] = [];
let activityLogs: ActivityLog[] = [];

function pushLog(tipo: ActivityLog['tipo'], mensaje: string): void {
  activityLogs = [
    {
      id: uid('log'),
      tipo,
      mensaje,
      fecha: nowIso(),
    },
    ...activityLogs,
  ];
}

export async function getProfile(): Promise<UserProfile> {
  if (hasSupabaseConfig) {
    return (await getProfileFromSupabase()) ?? profile;
  }

  return profile;
}

export async function updateProfile(next: Partial<UserProfile>): Promise<UserProfile> {
  if (hasSupabaseConfig) {
    const updated = await updateProfileInSupabase(next);
    if (updated) {
      profile = updated;
      return updated;
    }
  }

  profile = { ...profile, ...next };
  return profile;
}

export async function getClients(): Promise<Client[]> {
  if (hasSupabaseConfig) {
    const rows = await getClientsFromSupabase();
    if (rows.length > 0) return rows;
  }

  return [...clients];
}

export async function createClient(input: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  if (hasSupabaseConfig) {
    return createClientInSupabase(input);
  }

  const created: Client = {
    ...input,
    id: uid('cli'),
    createdAt: nowIso(),
  };
  clients = [created, ...clients];
  pushLog('cliente_creado', `Cliente creado: ${created.nombreCompleto}`);
  return created;
}

export async function updateClient(
  id: string,
  patch: Partial<Omit<Client, 'id' | 'createdAt'>>,
): Promise<Client | null> {
  if (hasSupabaseConfig) {
    return updateClientInSupabase(id, patch);
  }

  const idx = clients.findIndex((c) => c.id === id);
  if (idx < 0) {
    return null;
  }
  clients[idx] = { ...clients[idx], ...patch };
  return clients[idx];
}

export async function deleteClient(id: string): Promise<boolean> {
  if (hasSupabaseConfig) {
    return deleteClientInSupabase(id);
  }

  const current = clients.length;
  clients = clients.filter((c) => c.id !== id);
  expedientes = expedientes.filter((e) => e.clienteId !== id);
  return clients.length < current;
}

export async function getExpedientes(): Promise<Expediente[]> {
  if (hasSupabaseConfig) {
    const rows = await getExpedientesFromSupabase();
    if (rows.length > 0) return rows;
  }

  return [...expedientes];
}

export async function createExpediente(
  input: Omit<Expediente, 'id' | 'numeroInterno' | 'createdAt'>,
): Promise<Expediente> {
  if (hasSupabaseConfig) {
    return createExpedienteInSupabase(input);
  }

  const created: Expediente = {
    ...input,
    id: uid('exp'),
    numeroInterno: nextInternalNumber(),
    createdAt: nowIso(),
  };
  expedientes = [created, ...expedientes];
  pushLog('expediente_creado', `Expediente ${created.numeroInterno} creado automáticamente.`);
  return created;
}

export async function updateExpediente(
  id: string,
  patch: Partial<Omit<Expediente, 'id' | 'numeroInterno' | 'createdAt'>>,
): Promise<Expediente | null> {
  if (hasSupabaseConfig) {
    return updateExpedienteInSupabase(id, patch);
  }

  const idx = expedientes.findIndex((e) => e.id === id);
  if (idx < 0) {
    return null;
  }
  expedientes[idx] = { ...expedientes[idx], ...patch };
  return expedientes[idx];
}

export async function deleteExpediente(id: string): Promise<boolean> {
  if (hasSupabaseConfig) {
    return deleteExpedienteInSupabase(id);
  }

  const current = expedientes.length;
  expedientes = expedientes.filter((e) => e.id !== id);
  documents = documents.filter((d) => d.expedienteId !== id);
  agendaEvents = agendaEvents.filter((event) => event.expedienteId !== id);
  return expedientes.length < current;
}

export async function setExpedienteStatus(id: string, estado: ExpedienteStatus): Promise<Expediente | null> {
  return updateExpediente(id, { estado });
}

export async function getDocuments(): Promise<LegalDocument[]> {
  if (hasSupabaseConfig) {
    const rows = await getDocumentsFromSupabase();
    if (rows.length > 0) return rows as LegalDocument[];
  }

  return [...documents] as LegalDocument[];
}

export function generateDocument(template: DocumentTemplate, titulo: string, datos: string): string {
  return `${titulo}\n\nPlantilla: ${template}\n\nContenido generado:\n${datos}\n\nEmitido por ITZALAN TECH · LEXIA Legal IA`;
}

export async function createDocument(input: {
  template: DocumentTemplate;
  titulo: string;
  contenido: string;
  expedienteId?: string;
}): Promise<LegalDocument> {
  if (hasSupabaseConfig) {
    return createDocumentInSupabase(input) as Promise<LegalDocument>;
  }

  const created: LegalDocument = {
    id: uid('doc'),
    template: input.template,
    titulo: input.titulo,
    contenido: input.contenido,
    expedienteId: input.expedienteId,
    createdAt: nowIso(),
  };
  documents = [created, ...documents];
  pushLog('documento_generado', `Documento generado: ${created.titulo}`);
  return created;
}

export async function getAgendaEvents(): Promise<AgendaEvent[]> {
  if (hasSupabaseConfig) {
    const rows = await getAgendaEventsFromSupabase();
    if (rows.length > 0) return rows;
  }

  return [...agendaEvents].sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
}

export async function createAgendaEvent(input: Omit<AgendaEvent, 'id'>): Promise<AgendaEvent> {
  if (hasSupabaseConfig) {
    return createAgendaEventInSupabase(input);
  }

  const created: AgendaEvent = {
    ...input,
    id: uid('ag'),
  };
  agendaEvents = [created, ...agendaEvents];
  if (created.tipoEvento === 'audiencia') {
    pushLog('alerta_dashboard', `Nueva audiencia registrada: ${created.titulo}`);
  }
  return created;
}

export async function toggleAgendaEvent(id: string): Promise<AgendaEvent | null> {
  if (hasSupabaseConfig) {
    return toggleAgendaEventInSupabase(id);
  }

  const idx = agendaEvents.findIndex((event) => event.id === id);
  if (idx < 0) {
    return null;
  }
  agendaEvents[idx] = {
    ...agendaEvents[idx],
    estado: agendaEvents[idx].estado === 'pendiente' ? 'completado' : 'pendiente',
  };
  return agendaEvents[idx];
}

export async function getPlans(): Promise<PaymentPlan[]> {
  if (hasSupabaseConfig) {
    const rows = await getPlansFromSupabase();
    if (rows.length > 0) return rows;
  }

  return [...plans];
}

export async function activatePlan(planId: string): Promise<PaymentPlan[]> {
  if (hasSupabaseConfig) {
    const rows = await activatePlanInSupabase(planId);
    if (rows.length > 0) return rows;
  }

  plans = plans.map((plan) => ({
    ...plan,
    activo: plan.id === planId,
  }));
  return [...plans];
}

export async function getActivePlan(): Promise<PaymentPlan | null> {
  if (hasSupabaseConfig) {
    return getActivePlanFromSupabase();
  }

  return plans.find((plan) => plan.activo) ?? null;
}

export async function getIaConsultations(): Promise<IaConsultation[]> {
  if (hasSupabaseConfig) {
    const rows = await getIaConsultationsFromSupabase();
    if (rows.length > 0) return rows;
  }

  return [...iaConsultations];
}

export async function saveIaConsultation(
  prompt: string,
  analysisType: IaConsultation['analysisType'],
  respuesta: string,
): Promise<IaConsultation> {
  if (hasSupabaseConfig) {
    return saveIaConsultationInSupabase(prompt, analysisType, respuesta);
  }

  const created: IaConsultation = {
    id: uid('ia'),
    prompt,
    analysisType,
    respuesta,
    createdAt: nowIso(),
  };
  iaConsultations = [created, ...iaConsultations];
  pushLog('consulta_ia', `Consulta IA registrada (${analysisType}).`);
  return created;
}

export function getActivityLogs(): ActivityLog[] {
  return [...activityLogs];
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  if (hasSupabaseConfig) {
    return getDashboardSnapshotFromSupabase();
  }

  const activeCases = expedientes.filter((exp) => exp.estado !== 'cerrado').length;
  const audienciasProximas = agendaEvents.filter(
    (event) => event.tipoEvento === 'audiencia' && event.estado === 'pendiente',
  ).length;
  const pagosPendientes = plans.filter((plan) => plan.estadoPago !== 'al-dia').length;

  const alertas: string[] = [];
  if (plans.some((plan) => plan.estadoPago === 'vencido')) {
    alertas.push('Tienes un pago vencido. Regulariza tu suscripción para evitar bloqueo.');
  }
  if (audienciasProximas > 0) {
    alertas.push(`Hay ${audienciasProximas} audiencias pendientes en agenda.`);
  }

  return {
    clientesRegistrados: clients.length,
    expedientesActivos: activeCases,
    documentosGenerados: documents.length,
    audienciasProximas,
    consultasIaRealizadas: iaConsultations.length,
    pagosPendientes,
    alertas,
  };
}
