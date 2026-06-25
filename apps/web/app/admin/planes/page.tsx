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
    <main className="min-h-screen bg-transparent p-6 text-slate-100">
      <section className="mx-auto max-w-6xl space-y-6 rounded-[1.2rem] border border-slate-700 bg-slate-900/80 p-8 shadow-[0_25px_60px_-45px_rgba(0,0,0,0.95)] lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Administración comercial</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-50">Panel de planes</h1>
            <p className="mt-2 text-slate-300">Gestión básica de planes y suscripciones activas de usuarios.</p>
          </div>
          <Link
            href="/dashboard"
            className="lex-button-secondary"
          >
            Volver al dashboard
          </Link>
        </div>

        {loading ? <p className="text-sm text-slate-300">Cargando panel...</p> : null}
        {error ? <p className="lex-notice-error">{error}</p> : null}
        {success ? <p className="lex-notice-success">{success}</p> : null}

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={createPlan} className="rounded-xl border border-slate-700 bg-[#111827] p-6">
            <h2 className="text-xl font-semibold text-slate-50">Crear nuevo plan</h2>
            <div className="mt-4 space-y-3">
              <input
                value={form.code}
                onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                placeholder="Código (ej: startup)"
                className="lex-input mt-0"
                required
              />
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre del plan"
                className="lex-input mt-0"
                required
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Descripción"
                rows={3}
                className="lex-input mt-0"
                required
              />
              <input
                value={form.monthlyPrice}
                onChange={(event) => setForm((current) => ({ ...current, monthlyPrice: Number(event.target.value) }))}
                type="number"
                min={0}
                className="lex-input mt-0"
                required
              />
              <input
                value={form.currency}
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                placeholder="Moneda"
                className="lex-input mt-0"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="lex-button-primary mt-4"
            >
              {saving ? 'Guardando...' : 'Crear plan'}
            </button>
          </form>

          <div className="rounded-xl border border-slate-700 bg-[#111827] p-6">
            <h2 className="text-xl font-semibold text-slate-50">Planes existentes</h2>
            <div className="mt-4 space-y-3">
              {plans.map((plan) => (
                <article key={plan.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                  <p className="font-semibold text-slate-50">{plan.name}</p>
                  <p className="text-sm text-slate-300">Código: {plan.code}</p>
                  <p className="text-sm text-slate-300">{plan.currency} {plan.monthlyPrice} / mes</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {plan.isActive ? 'activo' : 'inactivo'}
                  </p>
                  <button
                    type="button"
                    onClick={() => togglePlan(plan)}
                    className="mt-3 rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    {plan.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-[#111827] p-6">
          <h2 className="text-xl font-semibold text-slate-50">Suscripciones de usuarios</h2>
          <div className="mt-4 space-y-3">
            {subscriptions.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
                <p className="font-semibold text-slate-50">{item.user.name} ({item.user.email})</p>
                <p className="text-sm text-slate-300">
                  Plan: {item.plan?.name ?? 'Sin plan'} | Proveedor: {item.provider}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Estado: {item.status}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(['active', 'past_due', 'cancelled', 'expired'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => updateSubscriptionStatus(item.id, status)}
                      className="rounded-lg border border-slate-600 px-3 py-1 text-xs font-semibold text-slate-200"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
            {subscriptions.length === 0 ? <p className="text-sm text-slate-400">No hay suscripciones registradas aún.</p> : null}
          </div>
        </section>
      </section>
    </main>
  );
}
