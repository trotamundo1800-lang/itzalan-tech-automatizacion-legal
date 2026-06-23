import { buildAuthUser, createApiClient, baseUrl } from './e2e-config';

type AuthUserOverrides = Partial<{
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'abogado' | 'asistente' | 'cliente';
}>;

export async function registerUser(app: string = baseUrl, overrides: AuthUserOverrides = {}) {
  const payload = buildAuthUser(overrides);
  const response = await createApiClient(app).post('/auth/register').send(payload);

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('accessToken');
  expect(response.body).toHaveProperty('refreshToken');

  return {
    user: payload,
    response,
  };
}

export async function loginUser(
  app: string = baseUrl,
  overrides: AuthUserOverrides = {},
) {
  const user = buildAuthUser(overrides);
  const response = await createApiClient(app)
    .post('/auth/login')
    .send({ email: user.email, password: user.password });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('accessToken');

  return {
    user,
    response,
  };
}

export async function getAuthToken(app: string = baseUrl, overrides: AuthUserOverrides = {}) {
  const user = buildAuthUser(overrides);
  const registerResponse = await createApiClient(app).post('/auth/register').send(user);

  expect([201, 409]).toContain(registerResponse.status);

  const { response } = await loginUser(app, user);

  return {
    user,
    accessToken: response.body.accessToken,
    refreshToken: response.body.refreshToken,
  };
}