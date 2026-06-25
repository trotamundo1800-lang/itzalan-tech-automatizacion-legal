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
  let clienteId = '';
  let expedienteId = '';

  beforeAll(async () => {
    const auth = await getAuthToken(baseUrl, { role: 'abogado' });
    accessToken = auth.accessToken;

    const plans = await getPlans(accessToken, baseUrl);
    const basic = plans.find((plan) => plan.code === 'basic');
    expect(basic).toBeDefined();
    await subscribeWithStripe(accessToken, basic!.id, baseUrl);

    const now = Date.now();
    const client = await createClient(
      {
        nombre: `Cliente Persistencia ${now}`,
        email: `persistencia-${now}@example.com`,
        telefono: '555-800-111',
        direccion: 'Colonia Persistencia 100',
      },
      accessToken,
      baseUrl,
    );
    clienteId = client.id;

    const expediente = await createExpediente(
      {
        titulo: `Expediente Persistencia ${now}`,
        descripcion: 'Expediente preparado para conversaciones persistentes de IA.',
        tipo: 'civil',
        estado: 'en_proceso',
        fechaApertura: new Date().toISOString().slice(0, 10),
        clienteId,
      },
      accessToken,
      baseUrl,
    );
    expedienteId = expediente.id;
  });

  it('should reject requests without auth token', async () => {
    const response = await api.post('/api/ia-juridica/generar-borrador').send({
      tipoBorrador: 'Demanda',
      hechos: 'Hechos sin autenticacion para validar guard.',
      objetivo: 'Debe fallar con 401.',
    });

    expect(response.status).toBe(401);
  });

  it('should answer a free-form legal assistant query', async () => {
    const response = await api
      .post('/api/ia-juridica/consultar')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        consulta: 'Necesito una estrategia inicial para responder a un incumplimiento de contrato con riesgo de penalidades.',
        contexto: 'estrategia',
        detalle: 'Existe intercambio de correos, clausula penal y un plazo de subsanacion de 5 dias.',
      });

    expect(response.status).toBe(201);
    expect(['openai', 'local']).toContain(response.body.modo);
    expect(typeof response.body.respuesta).toBe('string');
    expect(response.body.respuesta.length).toBeGreaterThan(20);
    expect(Array.isArray(response.body.accionesSugeridas)).toBe(true);
  });

  it('should create an IA conversation linked to expediente and cliente', async () => {
    const response = await api
      .post('/api/ia-juridica/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Estrategia de incumplimiento contractual',
        contextoJuridico: 'estrategia',
        expedienteId,
        clienteId,
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Estrategia de incumplimiento contractual');
    expect(response.body.expedienteId).toBe(expedienteId);
    expect(response.body.clienteId).toBe(clienteId);
    expect(Array.isArray(response.body.contextSources)).toBe(true);
    expect(response.body.contextSources.length).toBeGreaterThanOrEqual(2);
  });

  it('should send a message and persist the IA response in the conversation history', async () => {
    const createResponse = await api
      .post('/api/ia-juridica/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Chat de estrategia litigiosa',
        contextoJuridico: 'estrategia',
      });

    const conversationId = createResponse.body.id;

    const messageResponse = await api
      .post(`/api/ia-juridica/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pregunta: 'Necesito una primera estrategia para responder un incumplimiento contractual con soporte por correos y clausula penal.',
        contextoJuridico: 'estrategia',
      });

    expect(messageResponse.status).toBe(201);
    expect(messageResponse.body.id).toBe(conversationId);
    expect(Array.isArray(messageResponse.body.messages)).toBe(true);
    expect(messageResponse.body.messages).toHaveLength(1);
    expect(messageResponse.body.messages[0].preguntaUsuario).toContain('Necesito una primera estrategia');
    expect(['openai', 'local']).toContain(messageResponse.body.messages[0].modo);
  });

  it('should list and retrieve IA conversation history', async () => {
    const createResponse = await api
      .post('/api/ia-juridica/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Historial de consulta IA',
        contextoJuridico: 'cumplimiento',
        clienteId,
      });
    const conversationId = createResponse.body.id;

    await api
      .post(`/api/ia-juridica/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        pregunta: 'Requiero validar riesgos de cumplimiento frente a una entrega parcial y reclamo del cliente.',
        contextoJuridico: 'cumplimiento',
      });

    const listResponse = await api
      .get('/api/ia-juridica/conversations')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((item: { id: string }) => item.id === conversationId)).toBe(true);

    const detailResponse = await api
      .get(`/api/ia-juridica/conversations/${conversationId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.id).toBe(conversationId);
    expect(Array.isArray(detailResponse.body.messages)).toBe(true);
    expect(detailResponse.body.messages.length).toBeGreaterThan(0);
  });

  it('should associate an existing IA conversation to an expediente', async () => {
    const createResponse = await api
      .post('/api/ia-juridica/conversations')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Conversacion sin expediente',
        contextoJuridico: 'general',
      });
    const conversationId = createResponse.body.id;

    const associationResponse = await api
      .patch(`/api/ia-juridica/conversations/${conversationId}/associations`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ expedienteId });

    expect(associationResponse.status).toBe(200);
    expect(associationResponse.body.expedienteId).toBe(expedienteId);
    expect(associationResponse.body.clienteId).toBe(clienteId);
    expect(associationResponse.body.contextSources.some((item: { sourceType: string; sourceId: string }) => item.sourceType === 'expediente' && item.sourceId === expedienteId)).toBe(true);
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
    expect(['openai', 'local']).toContain(response.body.modo);
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
    expect(['openai', 'local']).toContain(response.body.modo);
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
    expect(['openai', 'local']).toContain(response.body.modo);
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
    expect(['openai', 'local']).toContain(response.body.modo);
    expect(response.body.expedienteId).toBe(expediente.id);
    expect(typeof response.body.resumen).toBe('string');
    expect(response.body.resumen.length).toBeGreaterThan(20);
    expect(Array.isArray(response.body.puntosClave)).toBe(true);
  });
});
