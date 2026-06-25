import type { IaAnalysisType } from '../types';

const demoResponses: Record<IaAnalysisType, string> = {
  'Análisis legal':
    'Con base en la normativa civil y mercantil aplicable en Honduras, el caso presenta mérito jurídico inicial. Se recomienda reforzar prueba documental y línea de hechos cronológica.',
  'Resumen del caso':
    'Resumen ejecutivo: existe una relación contractual previa, un incumplimiento identificable y daños cuantificables. El expediente debe priorizar evidencia de notificación y plazo de subsanación.',
  'Riesgos jurídicos':
    'Riesgos detectados: objeción por falta de legitimación activa, discusión sobre competencia territorial y posible insuficiencia probatoria en perjuicios indirectos.',
  'Estrategia jurídica':
    'Estrategia sugerida: fase 1 conciliación con propuesta económica estructurada; fase 2 demanda con medidas cautelares; fase 3 negociación asistida por matriz de riesgo procesal.',
  'Probabilidad de éxito':
    'Estimación preliminar: probabilidad media-alta sujeta a robustez de prueba documental, trazabilidad de comunicaciones y consistencia pericial.',
  'Redacción de documento legal':
    'Borrador sugerido: encabezado con identificación completa, exposición breve de hechos, fundamentos de derecho aplicables, petitorio claro y anexos indexados.',
};

export async function analyzeWithDemoAi(input: string, analysisType: IaAnalysisType): Promise<string> {
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY);

  // The OpenAI branch is intentionally left as a placeholder for backend integration.
  if (openAiConfigured) {
    return `Integración preparada con OPENAI_API_KEY. Respuesta demo para entorno actual:\n\n${demoResponses[analysisType]}\n\nContexto recibido: ${input.slice(0, 280)}`;
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${demoResponses[analysisType]}\n\nExtracto del caso: ${input.slice(0, 280)}`);
    }, 700);
  });
}
