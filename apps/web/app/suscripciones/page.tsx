'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../lib/api';

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  isActive: boolean;
};

type MySubscription = {
  hasSubscription: boolean;
  isActive: boolean;
  subscription: {
    id: string;
    provider: 'stripe' | 'paypal';
    status: string;
    startsAt: string;
    endsAt: string;
    plan: Plan;
  } | null;
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export default function SuscripcionesPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<MySubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  function getToken() {
    return typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
  }

  function authHeaders() {
    const token = getToken();
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
  }

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [plansResponse, myResponse] = await Promise.all([
        apiFetch('/api/subscriptions/plans'),
        apiFetch('/api/subscriptions/me', { headers: authHeaders() }),
      ]);

      if (!plansResponse.ok) {
        const data = await plansResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los planes.'));
      }

      if (!myResponse.ok) {
        const data = await myResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo cargar tu estado de suscripción.'));
      }

      setPlans((await plansResponse.json()) as Plan[]);
      setSubscription((await myResponse.json()) as MySubscription);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function checkout(planId: string, provider: 'stripe' | 'paypal') {
    setProcessing(`${provider}:${planId}`);
    setError('');
    setMessage('');

    try {
      const response = await apiFetch(`/api/subscriptions/checkout/${provider}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo activar la suscripción.'));
      }

      const data = (await response.json()) as { message: string };
      setMessage(data.message || 'Suscripción activada.');
      await loadData();
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'No se pudo activar la suscripción.');
    } finally {
      setProcessing(null);
    }
  }

  async function cancelSubscription() {
    setProcessing('cancel');
    setError('');
    setMessage('');

    try {
      const response = await apiFetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: authHeaders(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo cancelar la suscripción.'));
      }

      const data = (await response.json()) as { message: string };
      setMessage(data.message);
      await loadData();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'No se pudo cancelar la suscripción.');
    } finally {
      setProcessing(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <section className="mx-auto max-w-6xl rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Comercial / Suscripciones</p>
            <h1 className="mt-3 text-3xl font-bold">Planes y pagos</h1>
            <p className="mt-2 text-slate-600">Activa tu suscripción con Stripe o PayPal para desbloquear funciones premium.</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Volver al dashboard
          </Link>
        </div>

        {loading ? <p className="mt-6 text-sm text-slate-600">Cargando planes...</p> : null}
        {error ? <p className="mt-6 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="mt-6 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}

        {subscription ? (
          <section className="mt-6 rounded-3xl bg-slate-900 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado de suscripción</p>
            <p className="mt-2 text-sm text-slate-200">
              {subscription.isActive && subscription.subscription
                ? `Activa: ${subscription.subscription.plan.name} (${subscription.subscription.provider.toUpperCase()})`
                : 'Sin suscripción activa'}
            </p>
            {subscription.subscription ? (
              <p className="mt-1 text-sm text-slate-300">
                Vigencia: {new Date(subscription.subscription.startsAt).toLocaleDateString()} -{' '}
                {new Date(subscription.subscription.endsAt).toLocaleDateString()}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={processing === 'cancel' || !subscription.isActive}
                onClick={cancelSubscription}
                className="rounded-full border border-slate-500 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing === 'cancel' ? 'Cancelando...' : 'Cancelar suscripción'}
              </button>
            </div>
          </section>
        ) : null}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">{plan.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {plan.currency} {plan.monthlyPrice}
                <span className="text-sm font-medium text-slate-500"> / mes</span>
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => checkout(plan.id, 'stripe')}
                  disabled={processing !== null}
                  className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing === `stripe:${plan.id}` ? 'Procesando Stripe...' : 'Pagar con Stripe'}
                </button>
                <button
                  type="button"
                  onClick={() => checkout(plan.id, 'paypal')}
                  disabled={processing !== null}
                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing === `paypal:${plan.id}` ? 'Procesando PayPal...' : 'Pagar con PayPal'}
                </button>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-600">
          <p>
            Consulta nuestros{' '}
            <Link href="/terminos" className="font-semibold text-slate-900 underline underline-offset-2">
              Términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" className="font-semibold text-slate-900 underline underline-offset-2">
              Política de privacidad
            </Link>{' '}
            antes de activar un plan.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            También puedes revisar el{' '}
            <Link href="/manual" className="font-semibold text-slate-700 underline underline-offset-2">
              manual comercial
            </Link>{' '}
            para ver el flujo de uso y demo.
          </p>
        </div>
      </section>
    </main>
  );
}
