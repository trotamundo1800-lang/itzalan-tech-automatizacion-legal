import { baseUrl, createApiClient, e2eTimeout } from './helpers/e2e-config';
import { getAuthToken } from './helpers/auth';

const api = createApiClient(baseUrl);

describe('Clients E2E', () => {
  jest.setTimeout(e2eTimeout);
  let accessToken = '';

  beforeAll(async () => {
    const auth = await getAuthToken(baseUrl, { role: 'abogado' });
    accessToken = auth.accessToken;
  });

  it('should create, list and delete a client', async () => {
    const seed = Date.now();
    const createPayload = {
      nombre: `Cliente E2E ${seed}`,
      email: `cliente+${seed}@example.com`,
      telefono: '5551234567',
      direccion: 'Direccion de prueba 123',
      estado: 'activo',
    };

    const createResponse = await api
      .post('/api/clientes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createPayload);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      ...createPayload,
    });

    const listResponse = await api
      .get('/api/clientes')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((client: { id: string }) => client.id === createResponse.body.id)).toBe(true);

    const deleteResponse = await api
      .delete(`/api/clientes/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Cliente eliminado');
  });
});
