import { baseUrl, createApiClient, e2eTimeout } from './helpers/e2e-config';
import { getAuthToken } from './helpers/auth';
import { createClient } from './helpers/clients';
import { createExpediente } from './helpers/expedientes';
import { getPlans, subscribeWithStripe } from './helpers/subscriptions';

const api = createApiClient(baseUrl);

describe('Agenda E2E', () => {
  jest.setTimeout(e2eTimeout);
  let accessToken = '';

  beforeAll(async () => {
    const auth = await getAuthToken(baseUrl, { role: 'abogado' });
    accessToken = auth.accessToken;
    const plans = await getPlans(accessToken, baseUrl);
    const basic = plans.find((p) => p.code === 'basic')!;
    await subscribeWithStripe(accessToken, basic.id, baseUrl);
  });

  it('should create, list, update and delete agenda events', async () => {
    const seed = Date.now();
    const client = await createClient(
      {
        nombre: `Cliente Agenda ${seed}`,
        email: `agenda+${seed}@example.com`,
        telefono: '5557778899',
        direccion: 'Direccion agenda prueba',
        estado: 'activo',
      },
      accessToken,
    );

    const expediente = await createExpediente(
      {
        titulo: `Expediente Agenda ${seed}`,
        descripcion: 'Expediente base para agenda e2e con vinculo a cliente.',
        tipo: 'Civil',
        estado: 'abierto',
        fechaApertura: new Date().toISOString().slice(0, 10),
        clienteId: client.id,
      },
      accessToken,
    );

    const createPayload = {
      fechaHora: new Date(Date.now() + 3600_000).toISOString(),
      tipoEvento: 'audiencia' as const,
      estado: 'pendiente' as const,
      recordatorio: 'Enviar aviso un dia antes',
      observaciones: 'Primera audiencia de prueba e2e.',
      clienteId: client.id,
      expedienteId: expediente.id,
    };

    const createResponse = await api
      .post('/api/agenda')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createPayload);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      tipoEvento: createPayload.tipoEvento,
      estado: createPayload.estado,
      clienteId: client.id,
      expedienteId: expediente.id,
      recordatorio: createPayload.recordatorio,
    });

    const getResponse = await api
      .get(`/api/agenda/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toMatchObject({
      id: createResponse.body.id,
      tipoEvento: createPayload.tipoEvento,
      clienteId: client.id,
    });

    const listResponse = await api
      .get('/api/agenda')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((evento: { id: string }) => evento.id === createResponse.body.id)).toBe(true);

    const updateResponse = await api
      .patch(`/api/agenda/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        estado: 'completado',
        observaciones: 'Audiencia atendida y cerrada.',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.estado).toBe('completado');
    expect(updateResponse.body.observaciones).toContain('cerrada');

    const deleteResponse = await api
      .delete(`/api/agenda/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Evento de agenda eliminado');

    const missingResponse = await api
      .get(`/api/agenda/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(missingResponse.status).toBe(404);

    await api
      .delete(`/api/expedientes/${expediente.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    await api
      .delete(`/api/clientes/${client.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
  });
});
