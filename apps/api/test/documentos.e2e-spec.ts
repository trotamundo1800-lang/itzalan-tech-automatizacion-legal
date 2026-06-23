import { getAuthToken } from './helpers/auth';
import { createClient } from './helpers/clients';
import { createExpediente } from './helpers/expedientes';
import { createDocumento } from './helpers/documentos';
import { baseUrl, createApiClient, e2eTimeout, missingDraftId } from './helpers/e2e-config';

const api = createApiClient(baseUrl);

describe('Documentos E2E', () => {
  jest.setTimeout(e2eTimeout);
  let accessToken = '';

  beforeAll(async () => {
    const auth = await getAuthToken(baseUrl, { role: 'abogado' });
    accessToken = auth.accessToken;
  });

  it('should reject requests without auth token', async () => {
    const response = await api.get('/api/documentos');
    expect(response.status).toBe(401);
  });

  it('should create, read, update and delete a legal document', async () => {
    const now = Date.now();
    const client = await createClient(
      {
        nombre: `Cliente Doc ${now}`,
        email: `doc-${now}@example.com`,
        telefono: '555-000-100',
        direccion: 'Calle Documento 123',
      },
      accessToken,
      baseUrl,
    );

    const expediente = await createExpediente(
      {
        titulo: `Expediente Doc ${now}`,
        descripcion: 'Expediente para validar generacion documental.',
        tipo: 'civil',
        estado: 'abierto',
        fechaApertura: new Date().toISOString().slice(0, 10),
        clienteId: client.id,
      },
      accessToken,
      baseUrl,
    );

    const created = await createDocumento(
      {
        nombreArchivo: `demanda-${now}.docx`,
        tipoDocumento: 'Demanda',
        formato: 'docx',
        plantilla: 'Demanda de {{actor}} contra {{demandado}}.',
        variables: {
          actor: client.nombre,
          demandado: 'Parte Demandada E2E',
        },
        clienteId: client.id,
        expedienteId: expediente.id,
      },
      accessToken,
      baseUrl,
    );

    expect(created.formato).toBe('docx');
    expect(created.contenidoTexto).toContain(client.nombre);
    expect(created.contenidoBase64.length).toBeGreaterThan(20);

    const listResponse = await api
      .get('/api/documentos')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.some((doc: { id: string }) => doc.id === created.id)).toBe(true);

    const getResponse = await api
      .get(`/api/documentos/${created.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.id).toBe(created.id);

    const patchResponse = await api
      .patch(`/api/documentos/${created.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        formato: 'pdf',
        plantilla: 'Escrito final para {{actor}} en estado de revision.',
      });

    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.formato).toBe('pdf');
    expect(patchResponse.body.contenidoTexto).toContain(client.nombre);
    expect(patchResponse.body.contenidoBase64.length).toBeGreaterThan(20);

    const deleteResponse = await api
      .delete(`/api/documentos/${created.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.message).toBe('Documento eliminado');

    const notFoundResponse = await api
      .get(`/api/documentos/${created.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(notFoundResponse.status).toBe(404);
    expect(notFoundResponse.body.message).toBe('Documento no encontrado');
  });

  it('should create a word and a pdf document using dedicated endpoints', async () => {
    const now = Date.now();
    const payload = {
      nombreArchivo: `borrador-${now}`,
      tipoDocumento: 'Memorial',
      plantilla: 'Memorial para {{cliente}} con objetivo {{objetivo}}.',
      variables: {
        cliente: `Cliente ${now}`,
        objetivo: 'validacion E2E',
      },
    };

    const wordResponse = await api
      .post('/api/documentos/generate-word')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(wordResponse.status).toBe(201);
    expect(wordResponse.body.formato).toBe('docx');

    const pdfResponse = await api
      .post('/api/documentos/generate-pdf')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(payload);

    expect(pdfResponse.status).toBe(201);
    expect(pdfResponse.body.formato).toBe('pdf');
  });

  it('should reject inconsistent cliente and expediente references', async () => {
    const now = Date.now();
    const clientA = await createClient(
      {
        nombre: `Cliente A ${now}`,
        email: `doc-a-${now}@example.com`,
        telefono: '555-000-201',
        direccion: 'Avenida A 10',
      },
      accessToken,
      baseUrl,
    );

    const clientB = await createClient(
      {
        nombre: `Cliente B ${now}`,
        email: `doc-b-${now}@example.com`,
        telefono: '555-000-202',
        direccion: 'Avenida B 20',
      },
      accessToken,
      baseUrl,
    );

    const expediente = await createExpediente(
      {
        titulo: `Expediente Mismatch ${now}`,
        descripcion: 'Caso para validar consistencia de relaciones.',
        tipo: 'laboral',
        estado: 'en_proceso',
        fechaApertura: new Date().toISOString().slice(0, 10),
        clienteId: clientA.id,
      },
      accessToken,
      baseUrl,
    );

    const response = await api
      .post('/api/documentos')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        nombreArchivo: `inconsistente-${now}.pdf`,
        tipoDocumento: 'Informe',
        formato: 'pdf',
        plantilla: 'Texto base {{dato}}',
        variables: { dato: 'valor' },
        clienteId: clientB.id,
        expedienteId: expediente.id,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('El expediente no pertenece al cliente seleccionado');
  });

  it('should return 404 for a missing legal document', async () => {
    const response = await api
      .get(`/api/documentos/${missingDraftId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Documento no encontrado');
  });
});
