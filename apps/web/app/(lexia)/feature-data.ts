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
    status: 'planned' | 'connected';
    endpoint: string;
    method: 'GET' | 'POST';
  };
};

export const featureModules: Record<FeatureModule['slug'], FeatureModule> = {
  contratos: {
    slug: 'contratos',
    title: 'Generar contrato',
    eyebrow: 'LEXIA / Contratos',
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
      status: 'connected',
      endpoint: '/api/contracts/generate',
      method: 'POST',
    },
  },
  agenda: {
    slug: 'agenda',
    title: 'Agenda procesal',
    eyebrow: 'LEXIA / Agenda',
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
      status: 'connected',
      endpoint: '/api/agenda',
      method: 'GET',
    },
  },
  analisis: {
    slug: 'analisis',
    title: 'Análisis jurídico',
    eyebrow: 'LEXIA / Análisis',
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
      status: 'connected',
      endpoint: '/api/ia-juridica/analizar-documento',
      method: 'POST',
    },
  },
  documentos: {
    slug: 'documentos',
    title: 'Documentos legales',
    eyebrow: 'LEXIA / Documentos',
    description:
      'Gestiona documentos asociados a clientes y expedientes, con generación rápida en formato Word y PDF.',
    highlights: [
      {
        title: 'CRUD completo',
        description: 'Crea, edita, lista y elimina documentos persistidos en la API.',
      },
      {
        title: 'Generación DOCX/PDF',
        description: 'Emite documentos desde plantilla y variables con endpoints dedicados.',
      },
      {
        title: 'Vinculación legal',
        description: 'Asocia cada documento a cliente y expediente para trazabilidad del caso.',
      },
    ],
    backend: {
      status: 'connected',
      endpoint: '/api/documentos',
      method: 'GET',
    },
  },
  'ia-juridica': {
    slug: 'ia-juridica',
    title: 'IA jurídica',
    eyebrow: 'LEXIA / IA',
    description:
      'Ejecuta análisis documental, generación de borradores y resúmenes de expediente sobre endpoints de IA jurídica.',
    highlights: [
      {
        title: 'Analizar documento',
        description: 'Evalúa riesgos y recomendaciones desde texto libre o documento almacenado.',
      },
      {
        title: 'Generar borrador',
        description: 'Construye borradores legales con hechos y objetivo jurídico definidos.',
      },
      {
        title: 'Resumir expediente',
        description: 'Produce síntesis accionable del estado y siguientes pasos del expediente.',
      },
    ],
    backend: {
      status: 'connected',
      endpoint: '/api/ia-juridica/analizar-documento',
      method: 'POST',
    },
  },
  clientes: {
    slug: 'clientes',
    title: 'Gestión de clientes',
    eyebrow: 'LEXIA / Clientes',
    description:
      'Administra el padrón de clientes con datos de contacto, estado y trazabilidad para cada relación legal.',
    highlights: [
      {
        title: 'Registro',
        description: 'Alta y edición de clientes con validación de datos obligatorios.',
      },
      {
        title: 'Seguimiento',
        description: 'Actualiza estado activo/inactivo y concentra datos de contacto operativos.',
      },
      {
        title: 'Base unificada',
        description: 'Conecta clientes con los expedientes creados en la plataforma.',
      },
    ],
    backend: {
      status: 'connected',
      endpoint: '/api/clientes',
      method: 'GET',
    },
  },
  expedientes: {
    slug: 'expedientes',
    title: 'Gestión de expedientes',
    eyebrow: 'LEXIA / Expedientes',
    description:
      'Crea y administra expedientes con estado procesal, tipo y vinculación directa al cliente responsable.',
    highlights: [
      {
        title: 'CRUD completo',
        description: 'Alta, consulta, edición y baja de expedientes jurídicos en la API.',
      },
      {
        title: 'Vinculación',
        description: 'Asocia cada expediente a un cliente existente para mantener consistencia.',
      },
      {
        title: 'Estado procesal',
        description: 'Clasifica por abierto, en proceso o cerrado para control operativo.',
      },
    ],
    backend: {
      status: 'connected',
      endpoint: '/api/expedientes',
      method: 'GET',
    },
  },
};