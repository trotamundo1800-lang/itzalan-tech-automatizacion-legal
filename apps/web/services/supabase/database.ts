import { hasSupabaseConfig, supabase } from './client';
import type {
  ActivityLog,
  AgendaEvent,
  Client,
  DashboardSnapshot,
  DocumentTemplate,
  Expediente,
  ExpedienteStatus,
  IaConsultation,
  PaymentPlan,
  UserProfile,
} from '../../types';

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  office_name: string | null;
  preferences: Record<string, unknown> | null;
};

type ClientRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  document_number: string;
  phone: string;
  email: string;
  address: string;
  client_type: 'persona' | 'empresa';
  notes: string;
  created_at: string;
};

type CaseRow = {
  id: string;
  user_id: string | null;
  client_id: string;
  internal_number: string;
  case_type: string;
  status: ExpedienteStatus;
  court_institution: string;
  start_date: string;
  next_hearing: string;
  notes: string;
  created_at: string;
};

type DocumentRow = {
  id: string;
  user_id: string | null;
  case_id: string | null;
  template: DocumentTemplate;
  title: string;
  content: string;
  created_at: string;
};

type EventRow = {
  id: string;
  user_id: string | null;
  client_id: string | null;
  case_id: string | null;
  title: string;
  event_date: string;
  event_time: string;
  event_type: AgendaEvent['tipoEvento'];
  status: AgendaEvent['estado'];
  created_at: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string | null;
  provider: 'stripe' | 'paypal';
  plan_name: PaymentPlan['nombre'];
  plan_code: string;
  monthly_price: number;
  currency: string;
  status: PaymentPlan['estadoPago'];
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  external_subscription_id: string | null;
  created_at: string;
};

type IaQueryRow = {
  id: string;
  user_id: string | null;
  client_id: string | null;
  case_id: string | null;
  prompt: string;
  analysis_type: IaConsultation['analysisType'];
  response: string;
  created_at: string;
};

function ensureSupabaseClient() {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error('Supabase no está configurado');
  }

  return supabase;
}

function mapUser(row: UserRow): UserProfile {
  return {
    nombre: row.full_name,
    correo: row.email,
    telefono: row.phone ?? '',
    tipoUsuario: row.role === 'administrador' ? 'administrador' : row.role === 'asistente' ? 'asistente' : 'abogado',
    despacho: row.office_name ?? '',
  };
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    nombreCompleto: row.full_name,
    dniOrRtn: row.document_number,
    telefono: row.phone,
    correo: row.email,
    direccion: row.address,
    tipoCliente: row.client_type,
    notas: row.notes,
    createdAt: row.created_at,
  };
}

function mapCase(row: CaseRow): Expediente {
  return {
    id: row.id,
    numeroInterno: row.internal_number,
    clienteId: row.client_id,
    tipoCaso: row.case_type,
    estado: row.status,
    juzgadoInstitucion: row.court_institution,
    fechaInicio: row.start_date,
    proximaAudiencia: row.next_hearing,
    notas: row.notes,
    createdAt: row.created_at,
  };
}

function mapDocument(row: DocumentRow) {
  return {
    id: row.id,
    template: row.template,
    titulo: row.title,
    contenido: row.content,
    expedienteId: row.case_id ?? undefined,
    createdAt: row.created_at,
  };
}

function mapEvent(row: EventRow): AgendaEvent {
  return {
    id: row.id,
    titulo: row.title,
    fecha: row.event_date,
    hora: row.event_time,
    tipoEvento: row.event_type,
    clienteId: row.client_id ?? undefined,
    expedienteId: row.case_id ?? undefined,
    estado: row.status,
  };
}

function mapPlan(row: SubscriptionRow): PaymentPlan {
  return {
    id: row.id,
    nombre: row.plan_name,
    precioMensual: row.monthly_price,
    estadoPago: row.status,
    fechaVencimiento: row.ends_at ?? row.created_at.slice(0, 10),
    activo: row.is_active,
  };
}

function mapIaQuery(row: IaQueryRow): IaConsultation {
  return {
    id: row.id,
    prompt: row.prompt,
    analysisType: row.analysis_type,
    respuesta: row.response,
    createdAt: row.created_at,
  };
}

export async function getProfileFromSupabase(): Promise<UserProfile | null> {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('users').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error || !data) return null;
  return mapUser(data as UserRow);
}

export async function updateProfileInSupabase(next: Partial<UserProfile>): Promise<UserProfile | null> {
  const client = ensureSupabaseClient();
  const current = await client.from('users').select('*').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!current.data) return null;

  const payload = {
    full_name: next.nombre ?? current.data.full_name,
    email: next.correo ?? current.data.email,
    phone: next.telefono ?? current.data.phone,
    office_name: next.despacho ?? current.data.office_name,
    role: next.tipoUsuario ?? current.data.role,
  };

  const { data, error } = await client.from('users').update(payload).eq('id', current.data.id).select('*').single();
  if (error || !data) return null;
  return mapUser(data as UserRow);
}

export async function getClientsFromSupabase(): Promise<Client[]> {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('clients').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as ClientRow[]).map(mapClient);
}

export async function createClientInSupabase(input: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('clients')
    .insert({
      full_name: input.nombreCompleto,
      document_number: input.dniOrRtn,
      phone: input.telefono,
      email: input.correo,
      address: input.direccion,
      client_type: input.tipoCliente,
      notes: input.notas,
    })
    .select('*')
    .single();
  if (error || !data) throw new Error('No se pudo crear el cliente');
  return mapClient(data as ClientRow);
}

export async function updateClientInSupabase(
  id: string,
  patch: Partial<Omit<Client, 'id' | 'createdAt'>>,
): Promise<Client | null> {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('clients')
    .update({
      full_name: patch.nombreCompleto,
      document_number: patch.dniOrRtn,
      phone: patch.telefono,
      email: patch.correo,
      address: patch.direccion,
      client_type: patch.tipoCliente,
      notes: patch.notas,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return null;
  return mapClient(data as ClientRow);
}

export async function deleteClientInSupabase(id: string): Promise<boolean> {
  const client = ensureSupabaseClient();
  const { error } = await client.from('clients').delete().eq('id', id);
  return !error;
}

export async function getExpedientesFromSupabase(): Promise<Expediente[]> {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('cases').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as CaseRow[]).map(mapCase);
}

export async function createExpedienteInSupabase(
  input: Omit<Expediente, 'id' | 'numeroInterno' | 'createdAt'>,
): Promise<Expediente> {
  const client = ensureSupabaseClient();
  const { count } = await client.from('cases').select('*', { count: 'exact', head: true });
  const nextNumber = `EXP-${String((count ?? 0) + 1).padStart(4, '0')}`;
  const { data, error } = await client
    .from('cases')
    .insert({
      client_id: input.clienteId,
      internal_number: nextNumber,
      case_type: input.tipoCaso,
      status: input.estado,
      court_institution: input.juzgadoInstitucion,
      start_date: input.fechaInicio,
      next_hearing: input.proximaAudiencia,
      notes: input.notas,
    })
    .select('*')
    .single();
  if (error || !data) throw new Error('No se pudo crear el expediente');
  return mapCase(data as CaseRow);
}

export async function updateExpedienteInSupabase(
  id: string,
  patch: Partial<Omit<Expediente, 'id' | 'numeroInterno' | 'createdAt'>>,
): Promise<Expediente | null> {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('cases')
    .update({
      client_id: patch.clienteId,
      case_type: patch.tipoCaso,
      status: patch.estado,
      court_institution: patch.juzgadoInstitucion,
      start_date: patch.fechaInicio,
      next_hearing: patch.proximaAudiencia,
      notes: patch.notas,
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) return null;
  return mapCase(data as CaseRow);
}

export async function deleteExpedienteInSupabase(id: string): Promise<boolean> {
  const client = ensureSupabaseClient();
  const { error } = await client.from('cases').delete().eq('id', id);
  return !error;
}

export async function getDocumentsFromSupabase() {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('documents').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as DocumentRow[]).map(mapDocument);
}

export async function createDocumentInSupabase(input: {
  template: DocumentTemplate;
  titulo: string;
  contenido: string;
  expedienteId?: string;
}) {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('documents')
    .insert({
      template: input.template,
      title: input.titulo,
      content: input.contenido,
      case_id: input.expedienteId ?? null,
    })
    .select('*')
    .single();
  if (error || !data) throw new Error('No se pudo guardar el documento');
  return mapDocument(data as DocumentRow);
}

export async function getAgendaEventsFromSupabase(): Promise<AgendaEvent[]> {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('events').select('*').order('event_date', { ascending: true }).order('event_time', { ascending: true });
  if (error || !data) return [];
  return (data as EventRow[]).map(mapEvent);
}

export async function createAgendaEventInSupabase(input: Omit<AgendaEvent, 'id'>): Promise<AgendaEvent> {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('events')
    .insert({
      title: input.titulo,
      event_date: input.fecha,
      event_time: input.hora,
      event_type: input.tipoEvento,
      client_id: input.clienteId ?? null,
      case_id: input.expedienteId ?? null,
      status: input.estado,
    })
    .select('*')
    .single();
  if (error || !data) throw new Error('No se pudo crear el evento');
  return mapEvent(data as EventRow);
}

export async function toggleAgendaEventInSupabase(id: string): Promise<AgendaEvent | null> {
  const client = ensureSupabaseClient();
  const current = await client.from('events').select('*').eq('id', id).maybeSingle();
  if (!current.data) return null;
  const nextStatus = current.data.status === 'pendiente' ? 'completado' : 'pendiente';
  const { data, error } = await client.from('events').update({ status: nextStatus }).eq('id', id).select('*').single();
  if (error || !data) return null;
  return mapEvent(data as EventRow);
}

export async function getPlansFromSupabase(): Promise<PaymentPlan[]> {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('subscriptions').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as SubscriptionRow[]).map(mapPlan);
}

export async function activatePlanInSupabase(planId: string): Promise<PaymentPlan[]> {
  const client = ensureSupabaseClient();
  const plans = await getPlansFromSupabase();
  const selected = plans.find((plan) => plan.id === planId);
  if (!selected) return plans;

  await client.from('subscriptions').update({ is_active: false }).neq('id', planId);
  await client.from('subscriptions').update({ is_active: true }).eq('id', planId);
  return getPlansFromSupabase();
}

export async function getActivePlanFromSupabase(): Promise<PaymentPlan | null> {
  const plans = await getPlansFromSupabase();
  return plans.find((plan) => plan.activo) ?? null;
}

export async function getIaConsultationsFromSupabase(): Promise<IaConsultation[]> {
  const client = ensureSupabaseClient();
  const { data, error } = await client.from('ai_queries').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as IaQueryRow[]).map(mapIaQuery);
}

export async function saveIaConsultationInSupabase(
  prompt: string,
  analysisType: IaConsultation['analysisType'],
  respuesta: string,
): Promise<IaConsultation> {
  const client = ensureSupabaseClient();
  const { data, error } = await client
    .from('ai_queries')
    .insert({ prompt, analysis_type: analysisType, response: respuesta })
    .select('*')
    .single();
  if (error || !data) throw new Error('No se pudo guardar la consulta IA');
  return mapIaQuery(data as IaQueryRow);
}

export async function getDashboardSnapshotFromSupabase(): Promise<DashboardSnapshot> {
  const client = ensureSupabaseClient();
  const [clients, cases, documents, events, aiQueries, subscriptions] = await Promise.all([
    client.from('clients').select('id', { count: 'exact', head: true }),
    client.from('cases').select('id', { count: 'exact', head: true }),
    client.from('documents').select('id', { count: 'exact', head: true }),
    client.from('events').select('id', { count: 'exact', head: true }).eq('event_type', 'audiencia').eq('status', 'pendiente'),
    client.from('ai_queries').select('id', { count: 'exact', head: true }),
    client.from('subscriptions').select('id, status', { count: 'exact' }),
  ]);

  const pendingSubscriptions = (subscriptions.data ?? []).filter((subscription) => subscription.status !== 'al-dia').length;
  const alerts: string[] = [];
  if ((subscriptions.data ?? []).some((subscription) => subscription.status === 'vencido')) {
    alerts.push('Tienes un pago vencido. Regulariza tu suscripción para evitar bloqueo.');
  }
  if ((events.count ?? 0) > 0) {
    alerts.push(`Hay ${events.count} audiencias pendientes en agenda.`);
  }

  return {
    clientesRegistrados: clients.count ?? 0,
    expedientesActivos: cases.count ?? 0,
    documentosGenerados: documents.count ?? 0,
    audienciasProximas: events.count ?? 0,
    consultasIaRealizadas: aiQueries.count ?? 0,
    pagosPendientes: pendingSubscriptions,
    alertas: alerts,
  };
}
