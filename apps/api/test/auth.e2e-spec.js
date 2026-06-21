const request = require('supertest');
const base = 'http://localhost:3001';

describe('Auth E2E', () => {
  jest.setTimeout(20000);

  it('should register, login, get profile, refresh and logout', async () => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'Password123!';

    const reg = await request(base)
      .post('/auth/register')
      .send({ email, password, name: 'E2E User' });
    expect(reg.status).toBe(201);
    expect(reg.body).toHaveProperty('accessToken');
    expect(reg.body).toHaveProperty('refreshToken');

    const login = await request(base).post('/auth/login').send({ email, password });
    expect(login.status).toBe(201);
    expect(login.body).toHaveProperty('accessToken');

    const access = login.body.accessToken;
    const profile = await request(base).get('/auth/profile').set('Authorization', 'Bearer ' + access);
    expect(profile.status).toBe(200);
    expect(profile.body).toHaveProperty('email', email);

    const refreshRes = await request(base).post('/auth/refresh').send({ refreshToken: login.body.refreshToken });
    expect(refreshRes.status).toBe(201);
    expect(refreshRes.body).toHaveProperty('accessToken');

    const logout = await request(base).post('/auth/logout').send({ refreshToken: login.body.refreshToken });
    expect(logout.status).toBe(201);
  });
});
