import { baseUrl, buildContractDraftData, createApiClient } from './e2e-config';

type ContractDraftPayload = {
  tipoContrato: string;
  nombreCliente: string;
  descripcionCaso: string;
};

type ContractDraftResponse = {
  id: string;
  createdAt: string;
  updatedAt: string;
  tipoContrato: string;
  nombreCliente: string;
  descripcionCaso: string;
  titulo: string;
  resumen: string;
  clausulasSugeridas: string[];
};

export async function createContractDraft(
  app: string = baseUrl,
  overrides: Partial<ContractDraftPayload> = {},
  accessToken?: string,
): Promise<ContractDraftResponse> {
  const payload: ContractDraftPayload = buildContractDraftData(overrides);

  const request = createApiClient(app).post('/api/contracts/generate');
  if (accessToken) {
    request.set('Authorization', `Bearer ${accessToken}`);
  }
  const response = await request.send(payload);

  expect(response.status).toBe(201);

  return response.body as ContractDraftResponse;
}