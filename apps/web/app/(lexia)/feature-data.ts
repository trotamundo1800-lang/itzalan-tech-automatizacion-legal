export type FeatureModule = {
  slug: 'contratos' | 'agenda' | 'analisis' | 'clientes' | 'expedientes' | 'documentos' | 'ia-juridica';
  title: string;
  eyebrow: string;
  description: string;
  highlights: Array<{
    title: string;
    description: string;
  }>;
  backend: {
    status: 'planned';
    endpoint: string;
    method: 'GET' | 'POST';
  };
};

export const featureModules: Record<FeatureModule['slug'], FeatureModule> = {
  contratos: {
    slug: 'contratos',
    title: 'Generar contrato',
    eyebrow: 'Contratos',
    description:
      'Prepara contratos asistidos con plantillas, variables del caso y validaciones previas al envio al cliente.',
    highlights: [
      {
        title: 'Plantillas',
        description: 'Compra-venta, prestación de servicios, NDA y documentos societarios.',
      },
      {
        title: 'Variables',
        description: 'Completa datos de partes, objeto, montos, vigencia y cláusulas especiales.',
      },
      {
        title: 'Control legal',
        description: 'Revisa consistencia documental antes de emitir el borrador definitivo.',
      },
    ],
    backend: {
      status: 'planned',
      endpoint: '/contracts/generate',
      method: 'POST',
    },
  },
  agenda: {
    slug: 'agenda',
    title: 'Agenda procesal',
    eyebrow: 'Agenda',
    description:
      'Consulta vencimientos, audiencias y recordatorios operativos para el seguimiento de expedientes y clientes.',
    highlights: [
      {
        title: 'Audiencias',
        description: 'Visualiza próximas comparecencias con prioridad y responsable asignado.',
      },
      {
        title: 'Plazos',
        description: 'Controla vencimientos críticos y evita omisiones en etapas procesales.',
      },
      {
        title: 'Recordatorios',
        description: 'Activa avisos de seguimiento para equipos internos y comunicación con clientes.',
      },
    ],
    backend: {
      status: 'planned',
      endpoint: '/calendar/events',
      method: 'GET',
    },
  },
  analisis: {
    slug: 'analisis',
    title: 'Análisis jurídico',
    eyebrow: 'Análisis',
    description:
      'Reune criterios, resúmenes y soporte analítico para revisar documentos, riesgos y estrategia legal.',
    highlights: [
      {
        title: 'Resumen de expediente',
        description: 'Condensa hechos, partes, hitos y documentos relevantes en una vista ejecutiva.',
      },
      {
        title: 'Riesgos',
        description: 'Identifica vacíos probatorios, fechas críticas y puntos de negociación sensibles.',
      },
      {
        title: 'Criterios',
        description: 'Agrupa observaciones legales, doctrina interna y lineamientos para la estrategia.',
      },
    ],
    backend: {
      status: 'planned',
      endpoint: '/analysis/summary',
      method: 'POST',
    },
  },
  clientes: {
    slug: 'clientes',
    title: 'CRM jurídico',
    eyebrow: 'Clientes',
    description: 'Gestiona fichas de clientes, estado de atención y datos de contacto con una vista comercial unificada.',
    highlights: [
      {
        title: 'Fichas unificadas',
        description: 'Consolida identidad, contacto y estado de servicio en un solo flujo operativo.',
      },
      {
        title: 'Historial visual',
        description: 'Mantén visibilidad continua de cambios y seguimiento en cada cuenta.',
      },
      {
        title: 'Métricas rápidas',
        description: 'Identifica cartera activa e inactiva para priorizar acciones comerciales.',
      },
    ],
    backend: {
      status: 'planned',
      endpoint: '/api/clientes',
      method: 'GET',
    },
  },
  expedientes: {
    slug: 'expedientes',
    title: 'Expedientes',
    eyebrow: 'Operación',
    description: 'Controla el ciclo completo de expedientes con contexto de cliente, estado procesal y hitos clave.',
    highlights: [
      {
        title: 'Timeline visual',
        description: 'Sigue evolución del caso con estados y fechas relevantes en una sola lectura.',
      },
      {
        title: 'Estados claros',
        description: 'Diferencia casos abiertos, en proceso o cerrados con indicadores directos.',
      },
      {
        title: 'Contexto ligado',
        description: 'Vincula expediente con cliente y agenda para evitar información dispersa.',
      },
    ],
    backend: {
      status: 'planned',
      endpoint: '/api/expedientes',
      method: 'GET',
    },
  },
  documentos: {
    slug: 'documentos',
    title: 'Documentos',
    eyebrow: 'Automatización',
    description: 'Administra documentos legales y generación Word/PDF con trazabilidad por cliente y expediente.',
    highlights: [
      {
        title: 'Plantillas dinámicas',
        description: 'Parametriza variables para acelerar redacción y mantener consistencia documental.',
      },
      {
        title: 'Formatos listos',
        description: 'Genera salidas en Word y PDF según requerimiento del despacho.',
      },
      {
        title: 'Control documental',
        description: 'Consulta histórico y estado de cada documento desde una vista central.',
      },
    ],
    backend: {
      status: 'planned',
      endpoint: '/api/documentos',
      method: 'GET',
    },
  },
  'ia-juridica': {
    slug: 'ia-juridica',
    title: 'IA Jurídica',
    eyebrow: 'Asistente legal',
    description: 'Analiza documentos, genera borradores y resume expedientes con una experiencia de conversación profesional.',
    highlights: [
      {
        title: 'Análisis contextual',
        description: 'Obtén riesgos y recomendaciones con enfoque práctico para decisiones legales.',
      },
      {
        title: 'Borradores asistidos',
        description: 'Acelera la primera versión de piezas jurídicas sin perder estructura técnica.',
      },
      {
        title: 'Resúmenes ejecutivos',
        description: 'Convierte expedientes extensos en puntos clave accionables para el equipo.',
      },
    ],
    backend: {
      status: 'planned',
      endpoint: '/api/ia-juridica/analizar-documento',
      method: 'POST',
    },
  },
};