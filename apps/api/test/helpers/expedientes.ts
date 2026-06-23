import { baseUrl, createApiClient } from './e2e-config';

type ExpedientePayload = {
  titulo: string;
  descripcion: string;
  tipo: string;
  estado: 'abierto' | 'en_proceso' | 'cerrado';
  fechaApertura: string;
  clienteId: string;
};

type ExpedienteResponse = ExpedientePayload & {
  id: string;
};

export async function createExpediente(
  payload: ExpedientePayload,
  accessToken: string,
  app: string = baseUrl,
): Promise<ExpedienteResponse> {
  const response = await createApiClient(app)
    .post('/api/expedientes')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload);

  expect(response.status).toBe(201);

  return response.body as ExpedienteResponse;
}
