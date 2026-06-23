import { baseUrl, createApiClient, e2eTimeout } from './helpers/e2e-config';
import { getAuthToken } from './helpers/auth';
import { createClient } from './helpers/clients';

const api = createApiClient(baseUrl);

describe('Expedientes E2E', () => {
  jest.setTimeout(e2eTimeout);
  let accessToken = '';

  beforeAll(async () => {
    const auth = await getAuthToken(baseUrl, { role: 'abogado' });
    accessToken = auth.accessToken;
  });

  it('should create, update and delete an expediente linked to a client', async () => {
    const seed = Date.now();
    const client = await createClient(
      {
        nombre: `Cliente Expediente ${seed}`,
        email: `expediente+${seed}@example.com`,
        telefono: '5559999988',
        direccion: 'Direccion base expediente',
        estado: 'activo',
      },
      accessToken,
    );

    const createPayload = {
      titulo: `Expediente ${seed}`,
      descripcion: 'Descripcion juridica inicial para expediente de prueba e2e.',
      tipo: 'Civil',
      estado: 'abierto',
      fechaApertura: new Date().toISOString().slice(0, 10),
      clienteId: client.id,
    };

    const createResponse = await api
      .post('/api/expedientes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createPayload);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      titulo: createPayload.titulo,
      estado: createPayload.estado,
      clienteId: client.id,
    });

    const updateResponse = await api
      .patch(`/api/expedientes/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ estado: 'en_proceso' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.estado).toBe('en_proceso');

    const deleteResponse = await api
      .delete(`/api/expedientes/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Expediente eliminado');

    await api
      .delete(`/api/clientes/${client.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
  });
});
