import { baseUrl, createApiClient } from './e2e-config';

type CreateDocumentoPayload = {
  nombreArchivo: string;
  tipoDocumento: string;
  formato: 'docx' | 'pdf';
  plantilla: string;
  variables?: Record<string, string>;
  clienteId?: string;
  expedienteId?: string;
  observaciones?: string;
};

type DocumentoResponse = {
  id: string;
  nombreArchivo: string;
  tipoDocumento: string;
  formato: 'docx' | 'pdf';
  plantilla: string;
  contenidoTexto: string;
  contenidoBase64: string;
  clienteId: string | null;
  expedienteId: string | null;
};

export async function createDocumento(
  payload: CreateDocumentoPayload,
  accessToken: string,
  app: string = baseUrl,
): Promise<DocumentoResponse> {
  const response = await createApiClient(app)
    .post('/api/documentos')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload);

  expect(response.status).toBe(201);

  return response.body as DocumentoResponse;
}
