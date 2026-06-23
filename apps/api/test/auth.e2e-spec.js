const { getAuthToken, registerUser } = require('./helpers/auth');
const { baseUrl, createApiClient, e2eTimeout } = require('./helpers/e2e-config');

const api = createApiClient(baseUrl);

describe('Auth E2E', () => {
  jest.setTimeout(e2eTimeout);

  it('should register, login, get profile, refresh and logout', async () => {
    const { user } = await registerUser(baseUrl);
    const { accessToken, refreshToken } = await getAuthToken(baseUrl, user);

    const profile = await api.get('/auth/profile').set('Authorization', 'Bearer ' + accessToken);
    expect(profile.status).toBe(200);
    expect(profile.body).toHaveProperty('email', user.email);

    const refreshRes = await api.post('/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(201);
    expect(refreshRes.body).toHaveProperty('accessToken');

    const logout = await api.post('/auth/logout').send({ refreshToken });
    expect(logout.status).toBe(201);
  });
});
