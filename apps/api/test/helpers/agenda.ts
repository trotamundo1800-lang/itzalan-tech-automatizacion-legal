import { baseUrl, createApiClient } from './e2e-config';

type AgendaPayload = {
  fechaHora: string;
  tipoEvento: 'audiencia' | 'vencimiento' | 'reunion' | 'diligencia';
  estado?: 'pendiente' | 'completado' | 'cancelado';
  recordatorio?: string;
  observaciones?: string;
  clienteId?: string;
  expedienteId?: string;
};

type AgendaResponse = AgendaPayload & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export async function createAgendaEvent(
  payload: AgendaPayload,
  accessToken: string,
  app: string = baseUrl,
): Promise<AgendaResponse> {
  const response = await createApiClient(app)
    .post('/api/agenda')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload);

  expect(response.status).toBe(201);

  return response.body as AgendaResponse;
}
