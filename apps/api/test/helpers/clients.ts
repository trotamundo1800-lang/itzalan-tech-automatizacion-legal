import { baseUrl, createApiClient } from './e2e-config';

type ClientPayload = {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estado?: 'activo' | 'inactivo';
};

type ClientResponse = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: 'activo' | 'inactivo';
};

export async function createClient(
  payload: ClientPayload,
  accessToken: string,
  app: string = baseUrl,
): Promise<ClientResponse> {
  const response = await createApiClient(app)
    .post('/api/clientes')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload);

  expect(response.status).toBe(201);

  return response.body as ClientResponse;
}
