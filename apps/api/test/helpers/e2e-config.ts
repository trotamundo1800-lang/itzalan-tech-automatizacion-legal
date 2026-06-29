import request from 'supertest';

export const baseUrl = 'http://localhost:3001';
export const e2eTimeout = 20000;
export const missingDraftId = '00000000-0000-0000-0000-000000000000';

type E2ETestApp = {
  getHttpServer(): unknown;
};

function getInitializedApp() {
  const app = (globalThis as { __E2E_APP__?: E2ETestApp }).__E2E_APP__;
  if (!app) {
    throw new Error('E2E app no inicializada. Verifica jest.setup.ts');
  }

  return app;
}

export function createApiClient(_app: string = baseUrl) {
  return {
    get: (url: string) => request(getInitializedApp().getHttpServer()).get(url),
    post: (url: string) => request(getInitializedApp().getHttpServer()).post(url),
    put: (url: string) => request(getInitializedApp().getHttpServer()).put(url),
    patch: (url: string) => request(getInitializedApp().getHttpServer()).patch(url),
    delete: (url: string) => request(getInitializedApp().getHttpServer()).delete(url),
    head: (url: string) => request(getInitializedApp().getHttpServer()).head(url),
    options: (url: string) => request(getInitializedApp().getHttpServer()).options(url),
  };
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