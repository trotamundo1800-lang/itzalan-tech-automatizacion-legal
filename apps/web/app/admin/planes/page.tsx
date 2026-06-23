'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  isActive: boolean;
  enablesPremiumFeatures: boolean;
};

type UserSubscription = {
  id: string;
  status: 'active' | 'past_due' | 'cancelled' | 'expired';
  provider: 'stripe' | 'paypal';
  user: { id: string; email: string; name: string };
  plan: { id: string; name: string; code: string };
};

const initialForm = {
  code: '',
  name: '',
  description: '',
  monthlyPrice: 19,
  currency: 'USD',
};

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export default function AdminPlanesPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);

  function authHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    if (!token) throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
    return { Authorization: `Bearer ${token}` };
  }

  async function ensureAdmin() {
    const response = await apiFetch('/auth/profile', { headers: authHeaders() });
    if (!response.ok) {
      throw new Error('No autorizado');
    }

    const data = (await response.json()) as { role: string };
    if (data.role !== 'admin') {
      throw new Error('Solo administradores pueden ver este panel.');
    }
  }

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      await ensureAdmin();

      const [plansResponse, subscriptionsResponse] = await Promise.all([
        apiFetch('/api/subscriptions/admin/plans', { headers: authHeaders() }),
        apiFetch('/api/subscriptions/admin/user-subscriptions', { headers: authHeaders() }),
      ]);

      if (!plansResponse.ok) {
        const data = await plansResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los planes.'));
      }

      if (!subscriptionsResponse.ok) {
        const data = await subscriptionsResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar las suscripciones de usuarios.'));
      }

      setPlans((await plansResponse.json()) as Plan[]);
      setSubscriptions((await subscriptionsResponse.json()) as UserSubscription[]);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'No se pudo cargar el panel.';
      setError(message);
      if (message.includes('sesión') || message.includes('No autorizado')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch('/api/subscriptions/admin/plans', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim(),
          monthlyPrice: Number(form.monthlyPrice),
          currency: form.currency.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo crear el plan.'));
      }

      setForm(initialForm);
      setSuccess('Plan creado.');
      await loadData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'No se pudo crear el plan.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePlan(plan: Plan) {
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch(`/api/subscriptions/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !plan.isActive }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo actualizar el plan.'));
      }

      setSuccess('Plan actualizado.');
      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'No se pudo actualizar el plan.');
    }
  }

  async function updateSubscriptionStatus(subscriptionId: string, status: UserSubscription['status']) {
    setError('');
    setSuccess('');

    try {
      const response = await apiFetch(`/api/subscriptions/admin/user-subscriptions/${subscriptionId}/status`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo actualizar la suscripción.'));
      }

      setSuccess('Estado de suscripción actualizado.');
      await loadData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'No se pudo actualizar la suscripción.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <section className="mx-auto max-w-6xl space-y-6 rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-200 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Administración comercial</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Panel de planes</h1>
            <p className="mt-2 text-slate-600">Gestión básica de planes y suscripciones activas de usuarios.</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Volver al dashboard
          </Link>
        </div>

        {loading ? <p className="text-sm text-slate-600">Cargando panel...</p> : null}
        {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={createPlan} className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Crear nuevo plan</h2>
            <div className="mt-4 space-y-3">
              <input
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                placeholder="Código (ej: startup)"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                required
              />
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre del plan"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                required
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Descripción"
                rows={3}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                required
              />
              <input
                value={form.monthlyPrice}
                onChange={(event) => setForm((current) => ({ ...current, monthlyPrice: Number(event.target.value) }))}
                type="number"
                min={0}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                required
              />
              <input
                value={form.currency}
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                placeholder="Moneda"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              {saving ? 'Guardando...' : 'Crear plan'}
            </button>
          </form>

          <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Planes existentes</h2>
            <div className="mt-4 space-y-3">
              {plans.map((plan) => (
                <article key={plan.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <p className="text-sm text-slate-600">Código: {plan.code}</p>
                  <p className="text-sm text-slate-600">{plan.currency} {plan.monthlyPrice} / mes</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {plan.isActive ? 'activo' : 'inactivo'}
                  </p>
                  <button
                    type="button"
                    onClick={() => togglePlan(plan)}
                    className="mt-3 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {plan.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Suscripciones de usuarios</h2>
          <div className="mt-4 space-y-3">
            {subscriptions.map((item) => (
              <article key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="font-semibold text-slate-900">{item.user.name} ({item.user.email})</p>
                <p className="text-sm text-slate-600">
                  Plan: {item.plan?.name ?? 'Sin plan'} | Proveedor: {item.provider}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Estado: {item.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['active', 'past_due', 'cancelled', 'expired'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateSubscriptionStatus(item.id, status)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {subscriptions.length === 0 ? <p className="text-sm text-slate-500">No hay suscripciones registradas aún.</p> : null}
          </div>
        </section>
      </section>
    </main>
  );
}
