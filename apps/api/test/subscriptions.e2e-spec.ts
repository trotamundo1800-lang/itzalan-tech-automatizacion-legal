import { getAuthToken } from './helpers/auth';
import { baseUrl, createApiClient, e2eTimeout } from './helpers/e2e-config';
import { getPlans, subscribeWithPaypal, subscribeWithStripe } from './helpers/subscriptions';

const api = createApiClient(baseUrl);

describe('Subscriptions E2E', () => {
  jest.setTimeout(e2eTimeout);

  let userToken = '';
  let adminToken = '';

  beforeAll(async () => {
    const userAuth = await getAuthToken(baseUrl, { role: 'abogado' });
    userToken = userAuth.accessToken;

    const adminAuth = await getAuthToken(baseUrl, { role: 'admin' });
    adminToken = adminAuth.accessToken;
  });

  it('should expose default plans and subscribe with stripe', async () => {
    const plans = await getPlans(userToken, baseUrl);

    expect(plans.some((plan) => plan.code === 'basic')).toBe(true);
    expect(plans.some((plan) => plan.code === 'professional')).toBe(true);
    expect(plans.some((plan) => plan.code === 'business')).toBe(true);

    const basicPlan = plans.find((plan) => plan.code === 'basic');
    expect(basicPlan).toBeDefined();

    await subscribeWithStripe(userToken, basicPlan!.id, baseUrl);

    const meResponse = await api
      .get('/api/subscriptions/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.isActive).toBe(true);
    expect(meResponse.body.subscription.provider).toBe('stripe');
  });

  it('should switch plan with paypal checkout', async () => {
    const plans = await getPlans(userToken, baseUrl);
    const professional = plans.find((plan) => plan.code === 'professional');
    expect(professional).toBeDefined();

    await subscribeWithPaypal(userToken, professional!.id, baseUrl);

    const meResponse = await api
      .get('/api/subscriptions/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.isActive).toBe(true);
    expect(meResponse.body.subscription.provider).toBe('paypal');
    expect(meResponse.body.subscription.plan.code).toBe('professional');
  });

  it('should allow admin to manage plans', async () => {
    const createResponse = await api
      .post('/api/subscriptions/admin/plans')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `startup-${Date.now()}`,
        name: 'Plan Startup',
        description: 'Plan temporal para validar panel admin.',
        monthlyPrice: 29,
        currency: 'USD',
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe('Plan Startup');

    const updateResponse = await api
      .patch(`/api/subscriptions/admin/plans/${createResponse.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ monthlyPrice: 39, isActive: false });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.monthlyPrice).toBe(39);
    expect(updateResponse.body.isActive).toBe(false);
  });

  it('should block premium endpoints without active subscription and allow after checkout', async () => {
    const noSubAuth = await getAuthToken(baseUrl, { role: 'abogado' });

    const blockedResponse = await api
      .post('/api/ia-juridica/generar-borrador')
      .set('Authorization', `Bearer ${noSubAuth.accessToken}`)
      .send({
        tipoBorrador: 'Demanda',
        hechos: 'Hechos de prueba para bloqueo premium sin suscripción activa.',
        objetivo: 'Validar restricción premium.',
      });

    expect(blockedResponse.status).toBe(403);
    expect(blockedResponse.body.message).toBe('Se requiere suscripción activa para esta función premium');

    const plans = await getPlans(noSubAuth.accessToken, baseUrl);
    const basic = plans.find((plan) => plan.code === 'basic');
    expect(basic).toBeDefined();

    await subscribeWithStripe(noSubAuth.accessToken, basic!.id, baseUrl);

    const allowedResponse = await api
      .post('/api/ia-juridica/generar-borrador')
      .set('Authorization', `Bearer ${noSubAuth.accessToken}`)
      .send({
        tipoBorrador: 'Demanda',
        hechos: 'Hechos de prueba para premium con suscripción activa.',
        objetivo: 'Validar habilitación premium.',
      });

    expect(allowedResponse.status).toBe(201);
    expect(typeof allowedResponse.body.borrador).toBe('string');
  });
});
