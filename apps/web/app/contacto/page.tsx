'use client';

import { useState } from 'react';
import { Building2, Clock3, Mail, Phone } from 'lucide-react';
import { Button, Card, HeroPanel, PageShell, SectionHeader, SurfaceCard } from '../../components/ui';
import { apiFetch } from '../lib/api';

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export default function ContactoPage() {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
            onSubmit={async (event) => {
              event.preventDefault();

              setLoading(true);
              setError('');
              setEnviado(false);

              try {
                const response = await apiFetch('/api/contacto', {
                  method: 'POST',
                  body: JSON.stringify({
                    nombre: nombre.trim(),
                    telefono: telefono.trim(),
                    correo: correo.trim(),
                    mensaje: mensaje.trim(),
                  }),
                });

                if (!response.ok) {
                  const data = await response.json().catch(() => null);
                  throw new Error(parseApiError(data, 'No se pudo enviar la solicitud.'));
                }

                setEnviado(true);
                setNombre('');
                setTelefono('');
                setCorreo('');
                setMensaje('');
              } catch (submitError) {
                setError(submitError instanceof Error ? submitError.message : 'No se pudo enviar la solicitud.');
              } finally {
                setLoading(false);
              }
            }}
          >
            <label className="lex-label">
              Nombre
              <input className="lex-input" value={nombre} onChange={(event) => setNombre(event.target.value)} required />
            </label>
            <label className="lex-label">
              Teléfono
              <input className="lex-input" value={telefono} onChange={(event) => setTelefono(event.target.value)} required />
            </label>
            <label className="lex-label">
              Correo
              <input type="email" className="lex-input" value={correo} onChange={(event) => setCorreo(event.target.value)} required />
            </label>
            <label className="lex-label">
              Mensaje
              <textarea className="lex-input" rows={5} value={mensaje} onChange={(event) => setMensaje(event.target.value)} required />
            </label>
            <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar solicitud'}</Button>
            {enviado ? <p className="lex-notice-success">Mensaje enviado correctamente.</p> : null}
            {error ? <p className="lex-notice-error">{error}</p> : null}
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
