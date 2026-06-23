import { createContractDraft } from './helpers/contracts';
import { baseUrl, createApiClient, e2eTimeout, missingDraftId } from './helpers/e2e-config';
import { getAuthToken } from './helpers/auth';

const api = createApiClient(baseUrl);

describe('Contracts E2E', () => {
  jest.setTimeout(e2eTimeout);
  let accessToken = '';

  beforeAll(async () => {
    const auth = await getAuthToken(baseUrl, { role: 'abogado' });
    accessToken = auth.accessToken;
  });

  it('should reject requests without auth token', async () => {
    const response = await api.get('/api/contracts/drafts');

    expect(response.status).toBe(401);
  });

  it('should get an existing draft by id', async () => {
    const draft = await createContractDraft(baseUrl, {}, accessToken);

    const response = await api
      .get(`/api/contracts/drafts/${draft.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: draft.id,
      tipoContrato: draft.tipoContrato,
      nombreCliente: draft.nombreCliente,
      descripcionCaso: draft.descripcionCaso,
    });
    expect(Array.isArray(response.body.clausulasSugeridas)).toBe(true);
    expect(response.body.clausulasSugeridas.length).toBeGreaterThan(0);
  });

  it('should return 404 when getting a non existing draft', async () => {
    const response = await api
      .get(`/api/contracts/drafts/${missingDraftId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Borrador no encontrado');
  });

  it('should update an existing draft with valid data', async () => {
    const draft = await createContractDraft(baseUrl, {}, accessToken);
    const patchPayload = {
      tipoContrato: 'Contrato de prestación de servicios',
      nombreCliente: 'Cliente Editado E2E',
      descripcionCaso: 'Descripcion actualizada para validar la edición persistente del borrador jurídico.',
      titulo: 'Contrato personalizado para cliente editado',
      resumen: 'Resumen actualizado manualmente desde la prueba end to end.',
      clausulasSugeridas: ['Cláusula uno actualizada.', 'Cláusula dos actualizada.'],
    };

    const response = await api
      .patch(`/api/contracts/drafts/${draft.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(patchPayload);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: draft.id,
      ...patchPayload,
    });

    const persisted = await api
      .get(`/api/contracts/drafts/${draft.id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(persisted.status).toBe(200);
    expect(persisted.body).toMatchObject({
      id: draft.id,
      ...patchPayload,
    });
  });

  it('should return 404 when updating a non existing draft', async () => {
    const response = await api
      .patch(`/api/contracts/drafts/${missingDraftId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ titulo: 'No existe' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Borrador no encontrado');
  });

  it('should regenerate an existing draft using the current contract data', async () => {
    const draft = await createContractDraft(baseUrl, {
      tipoContrato: 'Contrato mercantil personalizado',
      nombreCliente: 'Cliente Regeneracion E2E',
      descripcionCaso: 'Contexto base para regenerar cláusulas y resumen tras editar el borrador.',
    }, accessToken);

    const updateResponse = await api
      .patch(`/api/contracts/drafts/${draft.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        tipoContrato: 'Contrato de compraventa',
        nombreCliente: 'Cliente Regenerado Final',
        descripcionCaso: 'Operacion de compraventa con validación documental, entrega y obligaciones accesorias.',
        titulo: 'Titulo manual temporal',
        resumen: 'Resumen manual temporal',
        clausulasSugeridas: ['Cláusula temporal'],
      });

    expect(updateResponse.status).toBe(200);

    const response = await api
      .post(`/api/contracts/drafts/${draft.id}/regenerate`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send();

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: draft.id,
      tipoContrato: 'Contrato de compraventa',
      nombreCliente: 'Cliente Regenerado Final',
      descripcionCaso: 'Operacion de compraventa con validación documental, entrega y obligaciones accesorias.',
      titulo: 'Contrato de compraventa para Cliente Regenerado Final',
      resumen:
        'Borrador inicial de contrato de compraventa preparado para Cliente Regenerado Final con base en el contexto del caso: Operacion de compraventa con validación documental, entrega y obligaciones accesorias.',
      clausulasSugeridas: [
        'Identificación de partes y alcance del contrato de compraventa.',
        'Obligaciones principales relacionadas con: Operacion de compraventa con validación documental, entrega y obligaciones accesorias..',
        'Confidencialidad, cumplimiento normativo y tratamiento de información sensible.',
        'Vigencia, causales de terminación y mecanismo de solución de controversias.',
      ],
    });
  });

  it('should return 404 when regenerating a non existing draft', async () => {
    const response = await api
      .post(`/api/contracts/drafts/${missingDraftId}/regenerate`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Borrador no encontrado');
  });
});