'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BadgeDollarSign, CheckCircle2, CreditCard, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { HeroPanel, InfoBand, PageShell, SectionHeader, StatusBanner, SurfaceCard } from '../../components/ui';

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  isActive: boolean;
  limits?: {
    label: string;
    items: string[];
  };
};

type PlanDetails = {
  subtitle: string;
  includes: string[];
  excludes: string[];
};

const planDetailsByCode: Record<string, PlanDetails> = {
  basic: {
    subtitle: 'Ideal para abogados independientes.',
    includes: [
      'Dashboard Juridico',
      'CRM de Clientes',
      'Expedientes Digitales',
      'Agenda Procesal',
      'Recordatorios por correo',
      'Biblioteca Juridica',
      'Generador de documentos basicos',
      '100 consultas IA al mes',
      '20 documentos generados por IA al mes',
      '2 GB de almacenamiento',
      'Soporte estandar',
    ],
    excludes: [
      'Prestaciones laborales con IA',
      'Avaluos inmobiliarios',
      'Marketing Juridico',
      'Automatizaciones n8n',
      'Portal del Cliente',
    ],
  },
  professional: {
    subtitle: 'Ideal para despachos pequenos y medianos.',
    includes: [
      'Todo el Plan Basico',
      'Consultas IA ilimitadas*',
      'Analisis de demandas',
      'Analisis de sentencias',
      'Estrategias procesales con IA',
      'Generador avanzado de contratos',
      'Prestaciones laborales con IA',
      'Portal del Cliente',
      'WhatsApp integrado',
      '50 GB de almacenamiento',
      'Reportes avanzados',
      'Firma electronica basica',
      '5 automatizaciones n8n',
      'Soporte prioritario',
    ],
    excludes: ['Marketing Juridico IA completo', 'Multiples sucursales', 'API empresarial'],
  },
  business: {
    subtitle: 'Ideal para bufetes grandes, corporaciones y departamentos legales.',
    includes: [
      'Todo lo anterior',
      'Usuarios ilimitados',
      'IA Juridica avanzada',
      'Analisis predictivo de casos',
      'Probabilidad de exito procesal',
      'Avaluos inmobiliarios con IA',
      'Investigacion registral',
      'Gestion societaria',
      'Marketing Juridico IA',
      'Automatizaciones ilimitadas',
      'API empresarial',
      'Integraciones personalizadas',
      'Multiempresa',
      'Multi-sucursal',
      'Portal corporativo',
      '500 GB de almacenamiento',
      'Soporte VIP',
      'Capacitacion personalizada',
    ],
    excludes: [],
  },
  enterprise: {
    subtitle: 'Para firmas nacionales e instituciones.',
    includes: [
      'Todo el Plan Empresarial',
      'Infraestructura dedicada',
      'Dominio personalizado',
      'Marca blanca (White Label)',
      'Servidores privados',
      'Integracion con sistemas externos',
      'Desarrollo a medida',
      'Consultoria estrategica',
      'SLA empresarial',
      'Gerente de cuenta dedicado',
      'Implementacion asistida',
    ],
    excludes: [],
  },
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
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
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
    setSubscriptionLoaded(false);
    setError('');

    try {
      const plansResponse = await apiFetch('/api/subscriptions/plans');

      if (!plansResponse.ok) {
        const data = await plansResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudieron cargar los planes.'));
      }

      const plansData = (await plansResponse.json()) as Plan[];
      setPlans(plansData);

      const token = getToken();
      if (!token) {
        setSubscription(null);
        setSubscriptionLoaded(true);
        return;
      }

      const myResponse = await apiFetch('/api/subscriptions/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!myResponse.ok) {
        const data = await myResponse.json().catch(() => null);
        throw new Error(parseApiError(data, 'No se pudo cargar tu estado de suscripción.'));
      }

      setSubscription((await myResponse.json()) as MySubscription);
      setSubscriptionLoaded(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información.');
      setSubscriptionLoaded(true);
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
    <PageShell>
      <HeroPanel
        eyebrow="Comercial / Suscripciones"
        title="Planes pensados para despachos que necesitan escalar sin perder control operacional."
        description={
          <>
            <p>Seleccione el plan adecuado y active funciones premium con una experiencia de pago clara y profesional.</p>
            <p>La información de vigencia, proveedor y estado permanece visible para facilitar decisiones comerciales rápidas.</p>
          </>
        }
        actions={
          <Link href="/dashboard" className="lex-button-secondary border-slate-600 bg-slate-800/70 text-white hover:bg-slate-700 hover:text-white">
            Volver al dashboard
          </Link>
        }
        aside={
          !subscriptionLoaded ? (
            <p className="text-sm text-slate-300">Cargando estado de suscripción...</p>
          ) : subscription ? (
            <div className="space-y-3 text-sm text-slate-200">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Estado actual</p>
              <p className="text-lg font-semibold text-white">
                {subscription.isActive && subscription.subscription ? subscription.subscription.plan.name : 'Sin suscripción activa'}
              </p>
              <p>
                {subscription.isActive && subscription.subscription
                  ? `${subscription.subscription.provider.toUpperCase()} · ${new Date(subscription.subscription.startsAt).toLocaleDateString()} - ${new Date(subscription.subscription.endsAt).toLocaleDateString()}`
                  : 'Puede activar un plan con Stripe o PayPal.'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-300">Inicia sesión para ver tu estado de suscripción.</p>
          )
        }
      />

      <InfoBand
        items={[
          { label: 'Activación', value: 'Rápida', hint: 'Checkout inmediato', icon: <CreditCard className="h-4 w-4" /> },
          { label: 'Seguridad', value: 'Alta', hint: 'Acceso autenticado', icon: <ShieldCheck className="h-4 w-4" /> },
          { label: 'Escala', value: 'Flexible', hint: 'Planes por etapa', icon: <BadgeDollarSign className="h-4 w-4" /> },
          { label: 'Soporte', value: 'Prioritario', hint: 'Atención comercial', icon: <CheckCircle2 className="h-4 w-4" /> },
        ]}
      />

      {loading && plans.length === 0 ? <StatusBanner>Cargando planes...</StatusBanner> : null}
      {error ? <StatusBanner tone="error">{error}</StatusBanner> : null}
      {message ? <StatusBanner tone="success">{message}</StatusBanner> : null}

      {subscription ? (
        <SurfaceCard className="bg-slate-950 text-white">
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
              className="lex-button-secondary border-slate-600 bg-transparent text-white hover:bg-slate-700/70 hover:text-white"
            >
              {processing === 'cancel' ? 'Cancelando...' : 'Cancelar suscripción'}
            </button>
          </div>
        </SurfaceCard>
      ) : null}

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Comparación"
          title="Planes de pago presentados con claridad ejecutiva"
          subtitle="Selecciona una suscripción según tamaño de despacho, volumen y necesidad de automatización."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <SurfaceCard key={plan.id} className="flex h-full flex-col justify-between border-slate-700 bg-gradient-to-b from-slate-900/95 to-slate-950/80 shadow-[0_24px_58px_-36px_rgba(0,0,0,0.92)] transition duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-50">{plan.name}</h2>
                  {plan.code === 'professional' ? (
                    <span className="rounded-full border border-amber-400/50 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
                      Recomendado
                    </span>
                  ) : plan.code === 'business' ? (
                    <span className="rounded-full border border-cyan-400/50 bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-300">
                      Corporativo
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-medium text-slate-300">
                  {planDetailsByCode[plan.code]?.subtitle || 'Plan disponible para operacion legal.'}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{plan.description}</p>
                <p className="mt-4 text-3xl font-bold text-slate-50">
                  {plan.currency} {plan.monthlyPrice}
                  <span className="text-sm font-medium text-slate-400"> / mes</span>
                </p>
                <div className="mt-4 rounded-[1.25rem] border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Incluye</p>
                  <ul className="mt-2 space-y-1">
                    {(planDetailsByCode[plan.code]?.includes || []).slice(0, 8).map((item) => (
                      <li key={item}>+ {item}</li>
                    ))}
                  </ul>
                  {(planDetailsByCode[plan.code]?.includes || []).length > 8 ? (
                    <p className="mt-2 text-xs text-slate-400">y mas funcionalidades incluidas...</p>
                  ) : null}
                  {plan.limits?.items?.length ? (
                    <>
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {plan.limits.label || 'Límites'}
                      </p>
                      <ul className="mt-2 space-y-1 text-slate-200">
                        {plan.limits.items.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  {(planDetailsByCode[plan.code]?.excludes || []).length > 0 ? (
                    <>
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-400">No incluye</p>
                      <ul className="mt-2 space-y-1 text-slate-400">
                        {(planDetailsByCode[plan.code]?.excludes || []).map((item) => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                {plan.code === 'enterprise' ? (
                  <Link href="/feedback" className="lex-button-primary w-full text-center">
                    Solicitar propuesta Enterprise
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => checkout(plan.id, 'stripe')}
                      disabled={processing !== null}
                      className="lex-button-primary w-full"
                    >
                      {processing === `stripe:${plan.id}` ? 'Procesando Stripe...' : 'Pagar con Stripe'}
                    </button>
                    <button
                      type="button"
                      onClick={() => checkout(plan.id, 'paypal')}
                      disabled={processing !== null}
                      className="lex-button-secondary w-full"
                    >
                      {processing === `paypal:${plan.id}` ? 'Procesando PayPal...' : 'Pagar con PayPal'}
                    </button>
                  </>
                )}
              </div>
            </SurfaceCard>
          ))}
        </div>
      </section>

        <SurfaceCard muted className="text-sm text-slate-300">
          <p>
            Consulta nuestros{' '}
            <Link href="/terminos" className="font-semibold text-slate-100 underline underline-offset-2">
              Términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link href="/privacidad" className="font-semibold text-slate-100 underline underline-offset-2">
              Política de privacidad
            </Link>{' '}
            antes de activar un plan.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            También puedes revisar el{' '}
            <Link href="/manual" className="font-semibold text-slate-200 underline underline-offset-2">
              manual comercial
            </Link>{' '}
            para ver el flujo de uso y demo.
          </p>
        </SurfaceCard>
    </PageShell>
  );
}
