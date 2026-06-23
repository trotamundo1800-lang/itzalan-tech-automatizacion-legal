import { baseUrl, createApiClient } from './e2e-config';

export async function getPlans(accessToken: string, app: string = baseUrl) {
  const response = await createApiClient(app)
    .get('/api/subscriptions/plans')
    .set('Authorization', `Bearer ${accessToken}`);

  expect(response.status).toBe(200);
  return response.body as Array<{ id: string; code: string; name: string }>;
}

export async function subscribeWithStripe(accessToken: string, planId: string, app: string = baseUrl) {
  const response = await createApiClient(app)
    .post('/api/subscriptions/checkout/stripe')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ planId });

  expect(response.status).toBe(201);
  return response.body as { message: string };
}

export async function subscribeWithPaypal(accessToken: string, planId: string, app: string = baseUrl) {
  const response = await createApiClient(app)
    .post('/api/subscriptions/checkout/paypal')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ planId });

  expect(response.status).toBe(201);
  return response.body as { message: string };
}
