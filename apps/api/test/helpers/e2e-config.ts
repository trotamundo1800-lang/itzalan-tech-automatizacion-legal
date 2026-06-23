import request from 'supertest';

export const baseUrl = 'http://localhost:3001';
export const e2eTimeout = 20000;
export const missingDraftId = '00000000-0000-0000-0000-000000000000';

export function createApiClient(app: string = baseUrl) {
  return request(app);
}

export function buildAuthUser(
  overrides: Partial<{ email: string; password: string; name: string; role: 'admin' | 'abogado' | 'asistente' | 'cliente' }> = {},
) {
  const seed = Date.now();

  return {
    email: `test+${seed}@example.com`,
    password: 'Password123!',
    name: 'E2E User',
    role: 'cliente' as const,
    ...overrides,
  };
}

export function buildContractDraftData(
  overrides: Partial<{
    tipoContrato: string;
    nombreCliente: string;
    descripcionCaso: string;
  }> = {},
) {
  const seed = Date.now();

  return {
    tipoContrato: 'Contrato de confidencialidad',
    nombreCliente: `Cliente E2E ${seed}`,
    descripcionCaso: `Caso de prueba E2E ${seed} para validar borradores persistidos en contratos.`,
    ...overrides,
  };
}