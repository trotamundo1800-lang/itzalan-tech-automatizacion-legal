export type UserRole = 'abogado' | 'asistente' | 'administrador';

export type UserProfile = {
  nombre: string;
  correo: string;
  telefono: string;
  tipoUsuario: UserRole;
  despacho: string;
};

export type Client = {
  id: string;
  nombreCompleto: string;
  dniOrRtn: string;
  telefono: string;
  correo: string;
  direccion: string;
  tipoCliente: 'persona' | 'empresa';
  notas: string;
  createdAt: string;
};

export type ExpedienteStatus = 'abierto' | 'en-curso' | 'cerrado';

export type Expediente = {
  id: string;
  numeroInterno: string;
  clienteId: string;
  tipoCaso: string;
  estado: ExpedienteStatus;
  juzgadoInstitucion: string;
  fechaInicio: string;
  proximaAudiencia: string;
  notas: string;
  createdAt: string;
};

export type DocumentTemplate =
  | 'Contrato de servicios profesionales'
  | 'Carta de poder'
  | 'Carta de cobro'
  | 'Solicitud administrativa'
  | 'Dictamen legal'
  | 'Constancia'
  | 'Presupuesto legal';

export type LegalDocument = {
  id: string;
  template: DocumentTemplate;
  titulo: string;
  contenido: string;
  expedienteId?: string;
  createdAt: string;
};

export type AgendaEventType = 'audiencia' | 'reunion' | 'vencimiento' | 'tarea' | 'seguimiento';

export type AgendaEvent = {
  id: string;
  titulo: string;
  fecha: string;
  hora: string;
  tipoEvento: AgendaEventType;
  clienteId?: string;
  expedienteId?: string;
  estado: 'pendiente' | 'completado';
};

export type PlanName = 'Básico' | 'Profesional' | 'Corporativo';

export type PaymentPlan = {
  id: string;
  nombre: PlanName;
  precioMensual: number;
  estadoPago: 'al-dia' | 'pendiente' | 'vencido';
  fechaVencimiento: string;
  activo: boolean;
};

export type IaAnalysisType =
  | 'Análisis legal'
  | 'Resumen del caso'
  | 'Riesgos jurídicos'
  | 'Estrategia jurídica'
  | 'Probabilidad de éxito'
  | 'Redacción de documento legal';

export type IaConsultation = {
  id: string;
  prompt: string;
  analysisType: IaAnalysisType;
  respuesta: string;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  tipo:
    | 'cliente_creado'
    | 'expediente_creado'
    | 'documento_generado'
    | 'consulta_ia'
    | 'alerta_dashboard';
  mensaje: string;
  fecha: string;
};

export type DashboardSnapshot = {
  clientesRegistrados: number;
  expedientesActivos: number;
  documentosGenerados: number;
  audienciasProximas: number;
  consultasIaRealizadas: number;
  pagosPendientes: number;
  alertas: string[];
};
