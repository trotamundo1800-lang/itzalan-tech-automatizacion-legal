import { getAuthToken } from './helpers/auth';
import { createClient } from './helpers/clients';
import { createExpediente } from './helpers/expedientes';
import { createDocumento } from './helpers/documentos';
import { getPlans, subscribeWithStripe } from './helpers/subscriptions';
import { baseUrl, createApiClient, e2eTimeout } from './helpers/e2e-config';

const api = createApiClient(baseUrl);

describe('IA Juridica E2E', () => {
  jest.setTimeout(e2eTimeout);
  let accessToken = '';

  beforeAll(async () => {
    const auth = await getAuthToken(baseUrl, { role: 'abogado' });
    accessToken = auth.accessToken;

    const plans = await getPlans(accessToken, baseUrl);
    const basic = plans.find((plan) => plan.code === 'basic');
    expect(basic).toBeDefined();
    await subscribeWithStripe(accessToken, basic!.id, baseUrl);
  });

  it('should reject requests without auth token', async () => {
    const response = await api.post('/api/ia-juridica/generar-borrador').send({
      tipoBorrador: 'Demanda',
      hechos: 'Hechos sin autenticacion para validar guard.',
      objetivo: 'Debe fallar con 401.',
    });

    expect(response.status).toBe(401);
  });

  it('should analyze content directly', async () => {
    const response = await api
      .post('/api/ia-juridica/analizar-documento')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        contenido:
          'Este contrato contiene obligaciones de entrega sin plazo definido y no especifica mecanismos de incumplimiento.',
        pregunta: 'Identifica riesgos principales y propone correcciones.',
      });

    expect(response.status).toBe(201);
    expect(typeof response.body.analisis).toBe('string');
    expect(response.body.analisis.length).toBeGreaterThan(20);
    expect(Array.isArray(response.body.recomendaciones)).toBe(true);
  });

  it('should analyze a stored legal document by id', async () => {
    const now = Date.now();
    const documento = await createDocumento(
      {
        nombreArchivo: `analisis-${now}.docx`,
        tipoDocumento: 'Contrato',
        formato: 'docx',
        plantilla: 'Contrato para {{cliente}} con clausulas de confidencialidad y pagos pendientes.',
        variables: {
          cliente: `Cliente Analisis ${now}`,
        },
      },
      accessToken,
      baseUrl,
    );

    const response = await api
      .post('/api/ia-juridica/analizar-documento')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        documentoId: documento.id,
      });

    expect(response.status).toBe(201);
    expect(typeof response.body.analisis).toBe('string');
    expect(response.body.analisis.length).toBeGreaterThan(20);
  });

  it('should generate a legal draft', async () => {
    const response = await api
      .post('/api/ia-juridica/generar-borrador')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tipoBorrador: 'Demanda civil',
        hechos:
          'La parte demandada incumplio con la entrega pactada y rechazo las comunicaciones formales enviadas por el actor.',
        objetivo: 'Solicitar cumplimiento o indemnizacion por danos y perjuicios.',
      });

    expect(response.status).toBe(201);
    expect(response.body.tipoBorrador).toBe('Demanda civil');
    expect(typeof response.body.borrador).toBe('string');
    expect(response.body.borrador.length).toBeGreaterThan(20);
  });

  it('should summarize an expediente', async () => {
    const now = Date.now();
    const client = await createClient(
      {
        nombre: `Cliente IA ${now}`,
        email: `ia-${now}@example.com`,
        telefono: '555-900-111',
        direccion: 'Boulevard IA 77',
      },
      accessToken,
      baseUrl,
    );

    const expediente = await createExpediente(
      {
        titulo: `Expediente IA ${now}`,
        descripcion: 'Caso de incumplimiento contractual para resumen IA.',
        tipo: 'mercantil',
        estado: 'en_proceso',
        fechaApertura: new Date().toISOString().slice(0, 10),
        clienteId: client.id,
      },
      accessToken,
      baseUrl,
    );

    const response = await api
      .post('/api/ia-juridica/resumen-expediente')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        expedienteId: expediente.id,
      });

    expect(response.status).toBe(201);
    expect(response.body.expedienteId).toBe(expediente.id);
    expect(typeof response.body.resumen).toBe('string');
    expect(response.body.resumen.length).toBeGreaterThan(20);
    expect(Array.isArray(response.body.puntosClave)).toBe(true);
  });
});
