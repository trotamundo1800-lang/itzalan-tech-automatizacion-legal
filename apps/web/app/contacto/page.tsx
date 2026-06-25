'use client';

import { useState } from 'react';
import { Building2, Clock3, Mail, Phone } from 'lucide-react';
import { Button, Card, HeroPanel, PageShell, SectionHeader, SurfaceCard } from '../../components/ui';

export default function ContactoPage() {
  const [enviado, setEnviado] = useState(false);

  return (
    <PageShell>
      <HeroPanel
        eyebrow="Contacto"
        title="Conversemos sobre la modernización de tu operación legal"
        description={
          <>
            <p>Cuéntanos tu contexto y diseñamos una ruta de implementación alineada a tu práctica o despacho.</p>
            <p>Equipo comercial y técnico disponible para demos, pilotos y despliegues graduales.</p>
          </>
        }
      />

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card title="Formulario de contacto" subtitle="Te responderemos en menos de 24 horas hábiles.">
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              setEnviado(true);
            }}
          >
            <label className="lex-label">
              Nombre
              <input className="lex-input" required />
            </label>
            <label className="lex-label">
              Teléfono
              <input className="lex-input" required />
            </label>
            <label className="lex-label">
              Correo
              <input type="email" className="lex-input" required />
            </label>
            <label className="lex-label">
              Mensaje
              <textarea className="lex-input" rows={5} required />
            </label>
            <Button type="submit">Enviar solicitud</Button>
            {enviado ? <p className="lex-notice-success">Mensaje enviado correctamente.</p> : null}
          </form>
        </Card>

        <SurfaceCard className="space-y-5">
          <SectionHeader
            eyebrow="Canales directos"
            title="Atención comercial"
            subtitle="Responderemos con enfoque consultivo y plan de acción recomendado."
          />
          <article className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2 font-semibold text-slate-100"><Mail className="h-4 w-4 text-cyan-300" /> Correo</p>
            <p className="mt-2">contacto@itzalantech.com</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2 font-semibold text-slate-100"><Phone className="h-4 w-4 text-amber-300" /> WhatsApp / Teléfono</p>
            <p className="mt-2">+504 0000-0000</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2 font-semibold text-slate-100"><Building2 className="h-4 w-4 text-violet-300" /> Cobertura</p>
            <p className="mt-2">Honduras y Centroamérica para despachos y áreas legales empresariales.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="flex items-center gap-2 font-semibold text-slate-100"><Clock3 className="h-4 w-4 text-emerald-300" /> Tiempo de respuesta</p>
            <p className="mt-2">Menos de 24 horas hábiles en consultas de implementación.</p>
          </article>
        </SurfaceCard>
      </section>
    </PageShell>
  );
}
