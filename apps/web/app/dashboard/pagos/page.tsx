'use client';

import { useEffect, useState } from 'react';
import { Badge, Card, PricingCard, SectionHeader } from '../../../components/ui';
import { activatePlan, getActivePlan, getPlans } from '../../../lib/demoData';

export default function DashboardPagosPage() {
  const [plans, setPlans] = useState<Awaited<ReturnType<typeof getPlans>>>([]);
  const [activePlan, setActivePlan] = useState<Awaited<ReturnType<typeof getActivePlan>>>(null);

  useEffect(() => {
    void (async () => {
      setPlans(await getPlans());
      setActivePlan(await getActivePlan());
    })();
  }, []);

  return (
    <>
      <Card title="Pagos y suscripciones" subtitle="Preparado para futura integración con PAYPAL_CLIENT_ID">
        {activePlan ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Plan actual</p>
            <p className="text-2xl font-bold text-slate-50">{activePlan.nombre}</p>
            <p className="mt-1 text-sm text-slate-300">
              Estado del pago:{' '}
              <Badge
                tone={
                  activePlan.estadoPago === 'al-dia'
                    ? 'success'
                    : activePlan.estadoPago === 'pendiente'
                      ? 'warning'
                      : 'danger'
                }
              >
                {activePlan.estadoPago}
              </Badge>
            </p>
            <p className="text-sm text-slate-300">Fecha de vencimiento: {activePlan.fechaVencimiento}</p>
          </div>
        ) : null}
      </Card>

      <Card title="Planes disponibles">
        <SectionHeader title="Comparativa de planes" subtitle="Selecciona el plan óptimo para tu operación" />
        <div className="grid gap-3 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={async () => {
                setPlans(await activatePlan(plan.id));
                setActivePlan(await getActivePlan());
              }}
            >
              <PricingCard
                name={plan.nombre}
                price={`L ${plan.precioMensual}/mes`}
                description={`Estado de facturación: ${plan.estadoPago}. Vence ${plan.fechaVencimiento}.`}
                features={
                  plan.nombre === 'Básico'
                    ? ['Gestión base de clientes', 'Documentos esenciales', 'Soporte estándar']
                    : plan.nombre === 'Profesional'
                      ? ['Automatización avanzada', 'Asistente IA jurídico', 'Agenda con alertas']
                      : ['Multiusuario y métricas', 'Escalabilidad corporativa', 'Soporte prioritario']
                }
                highlighted={plan.nombre === 'Profesional'}
                actionLabel={plan.activo ? 'Plan activo' : 'Elegir plan'}
                footer={plan.activo ? 'Actualmente en uso por la cuenta.' : undefined}
              />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
