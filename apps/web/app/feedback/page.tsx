'use client';

import { useState } from 'react';
import { CheckCircle2, Gauge, MessageSquareQuote, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';
import { HeroPanel, InfoBand, PageShell, SectionHeader, SurfaceCard, StatusBanner } from '../../components/ui';

type FormData = {
  nombre: string;
  profesion: string;
  area: string;
  ciudad: string;
  fecha: string;
  facilUso: string;
  moduloUtil: string;
  problemaLogin: string;
  comentarioLogin: string;
  clientesExpUtil: string;
  documentosFrecuentes: string;
  formatosPrimero: string;
  iaAyudo: string;
  iaClara: string;
  iaConsultas: string;
  pagaria: string;
  planInteres: string;
  precioRazonable: string;
  funcionJustifica: string;
  recomendaria: string;
  calificacion: string;
  mejoras: string;
  comentarios: string;
};

const INITIAL: FormData = {
  nombre: '', profesion: '', area: '', ciudad: '', fecha: '',
  facilUso: '', moduloUtil: '', problemaLogin: '', comentarioLogin: '',
  clientesExpUtil: '', documentosFrecuentes: '', formatosPrimero: '',
  iaAyudo: '', iaClara: '', iaConsultas: '',
  pagaria: '', planInteres: '', precioRazonable: '', funcionJustifica: '',
  recomendaria: '', calificacion: '', mejoras: '', comentarios: '',
};

function Radio({ name, value, current, onChange, label }: {
  name: string; value: string; current: string;
  onChange: (v: string) => void; label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="accent-blue-700"
      />
      {label}
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-200">{label}</p>
      {children}
    </div>
  );
}

const inputCls = 'lex-input mt-1';
const textareaCls = `${inputCls} resize-none`;

export default function FeedbackPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          profesion: form.profesion,
          areaPractica: form.area,
          ciudad: form.ciudad,
          experienciaGeneral: form.facilUso,
          moduloMasUtil: form.moduloUtil,
          problemasRegistro: form.problemaLogin,
          utilidadClientesExpedientes: form.clientesExpUtil,
          documentosFrecuentes: form.documentosFrecuentes,
          formatosAgregar: form.formatosPrimero,
          ayudaIA: form.iaAyudo,
          claridadIA: form.iaClara,
          consultasIA: form.iaConsultas,
          pagaria: form.pagaria,
          planInteres: form.planInteres,
          precioRazonable: form.precioRazonable,
          funcionPago: form.funcionJustifica,
          recomendaria: form.recomendaria,
          calificacion: form.calificacion,
          mejoras: form.mejoras,
          comentarios: form.comentarios,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const msg = data?.message ?? 'Error al enviar. Intente nuevamente.';
        setSubmitError(Array.isArray(msg) ? msg[0] : msg);
        return;
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSubmitError('No se pudo conectar con el servidor. Intente nuevamente.');
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <PageShell>
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <InfoBand
            items={[
              { label: 'Estado', value: 'Registrado', hint: 'Feedback recibido', icon: <CheckCircle2 className="h-4 w-4" /> },
              { label: 'Enfoque', value: 'Producto', hint: 'Mejora continua', icon: <Gauge className="h-4 w-4" /> },
              { label: 'Uso', value: 'Piloto', hint: 'Validación comercial', icon: <ShieldCheck className="h-4 w-4" /> },
              { label: 'Entrada', value: 'Activa', hint: 'Opinión del abogado', icon: <MessageSquareQuote className="h-4 w-4" /> },
            ]}
          />
          <SurfaceCard className="text-center">
            <p className="text-4xl">✅</p>
            <h1 className="mt-4 text-2xl font-bold text-slate-50">Gracias por su retroalimentación</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Sus respuestas han sido registradas. Su opinión es clave para mejorar la plataforma antes del lanzamiento comercial.
            </p>
          </SurfaceCard>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-8">
        <HeroPanel
          eyebrow="Piloto / Producto"
          title="Retroalimentación estructurada para afinar la experiencia legal antes del lanzamiento."
          description={
            <>
              <p>Este formulario recoge señales de uso, claridad funcional y percepción comercial sobre la plataforma.</p>
              <p>El objetivo es mejorar la propuesta para abogados con base en observaciones reales y accionables.</p>
            </>
          }
          aside={
            <div className="space-y-3 text-sm text-slate-200">
              <p className="font-semibold text-white">Qué evaluamos</p>
              <p className="text-slate-300">Usabilidad, valor de IA jurídica, interés comercial, pricing y mejoras previas al lanzamiento.</p>
            </div>
          }
        />

        <InfoBand
          items={[
            { label: 'Usabilidad', value: 'Claridad', hint: 'Experiencia real del usuario', icon: <Gauge className="h-4 w-4" /> },
            { label: 'Valor IA', value: 'Precisión', hint: 'Análisis y borradores', icon: <ShieldCheck className="h-4 w-4" /> },
            { label: 'Comercial', value: 'Pricing', hint: 'Interés por plan', icon: <CheckCircle2 className="h-4 w-4" /> },
            { label: 'Señales', value: 'Accionables', hint: 'Mejoras antes del lanzamiento', icon: <MessageSquareQuote className="h-4 w-4" /> },
          ]}
        />

        <SurfaceCard className="space-y-4">
          <SectionHeader eyebrow="Perfil" title="Datos generales" subtitle="Identificación y contexto de la evaluación." />
          {(
            [
              ['nombre', 'Nombre'],
              ['profesion', 'Profesión'],
              ['area', 'Área de práctica'],
              ['ciudad', 'Ciudad'],
            ] as [keyof FormData, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input type="text" value={form[key]} onChange={(e) => set(key, e.target.value)} className={inputCls} />
            </Field>
          ))}
          <Field label="Fecha">
            <input type="date" value={form.fecha} onChange={(e) => set('fecha', e.target.value)} className={inputCls} />
          </Field>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <SectionHeader eyebrow="Bloque 1" title="Experiencia general" subtitle="Flujo inicial, accesos y primera percepción del producto." />

          <Field label="¿La plataforma fue fácil de usar?">
            <div className="flex flex-wrap gap-4">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="facilUso" value={v} current={form.facilUso} onChange={(v) => set('facilUso', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué módulo le pareció más útil?">
            <div className="flex flex-wrap gap-4">
              {['Clientes', 'Expedientes', 'Documentos', 'IA jurídica', 'Suscripciones', 'Otro'].map((v) => (
                <Radio key={v} name="moduloUtil" value={v} current={form.moduloUtil} onChange={(v) => set('moduloUtil', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Tuvo problemas para registrarse o iniciar sesión?">
            <div className="flex gap-4">
              {['Sí', 'No'].map((v) => (
                <Radio key={v} name="problemaLogin" value={v} current={form.problemaLogin} onChange={(v) => set('problemaLogin', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="Comentario:">
            <textarea rows={2} value={form.comentarioLogin} onChange={(e) => set('comentarioLogin', e.target.value)} className={textareaCls} />
          </Field>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <SectionHeader eyebrow="Bloque 2" title="Clientes, expedientes y documentos" subtitle="Valor operativo para la práctica diaria." />

          <Field label="¿La gestión de clientes y expedientes le parece útil?">
            <div className="flex flex-wrap gap-4">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="clientesExpUtil" value={v} current={form.clientesExpUtil} onChange={(v) => set('clientesExpUtil', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué documentos legales utiliza con mayor frecuencia?">
            <textarea rows={2} value={form.documentosFrecuentes} onChange={(e) => set('documentosFrecuentes', e.target.value)} className={textareaCls} />
          </Field>

          <Field label="¿Qué formatos deberían agregarse primero?">
            <textarea rows={2} value={form.formatosPrimero} onChange={(e) => set('formatosPrimero', e.target.value)} className={textareaCls} />
          </Field>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <SectionHeader eyebrow="Bloque 3" title="IA jurídica" subtitle="Utilidad, claridad y tipo de consulta esperada." />

          <Field label="¿La IA jurídica le ayudó en alguna tarea?">
            <div className="flex flex-wrap gap-4">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="iaAyudo" value={v} current={form.iaAyudo} onChange={(v) => set('iaAyudo', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Las respuestas fueron claras?">
            <div className="flex flex-wrap gap-4">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="iaClara" value={v} current={form.iaClara} onChange={(v) => set('iaClara', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué tipo de consultas le gustaría realizar?">
            <textarea rows={2} value={form.iaConsultas} onChange={(e) => set('iaConsultas', e.target.value)} className={textareaCls} />
          </Field>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <SectionHeader eyebrow="Bloque 4" title="Suscripciones y precio" subtitle="Interés comercial y umbral de compra." />

          <Field label="¿Pagaría por esta plataforma?">
            <div className="flex flex-wrap gap-4">
              {['Sí', 'Tal vez', 'No'].map((v) => (
                <Radio key={v} name="pagaria" value={v} current={form.pagaria} onChange={(v) => set('pagaria', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué plan le interesaría?">
            <div className="flex flex-wrap gap-4">
              {['Básico', 'Profesional', 'Empresarial'].map((v) => (
                <Radio key={v} name="planInteres" value={v} current={form.planInteres} onChange={(v) => set('planInteres', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué precio mensual considera razonable?">
            <input type="text" value={form.precioRazonable} onChange={(e) => set('precioRazonable', e.target.value)} className={inputCls} />
          </Field>

          <Field label="¿Qué función justificaría pagar una suscripción?">
            <textarea rows={2} value={form.funcionJustifica} onChange={(e) => set('funcionJustifica', e.target.value)} className={textareaCls} />
          </Field>
        </SurfaceCard>

        <SurfaceCard className="space-y-5">
          <SectionHeader eyebrow="Bloque 5" title="Recomendación final" subtitle="Señales de adopción, calificación y mejoras prioritarias." />

          <Field label="¿Recomendaría esta plataforma a otro abogado?">
            <div className="flex flex-wrap gap-4">
              {['Sí', 'Tal vez', 'No'].map((v) => (
                <Radio key={v} name="recomendaria" value={v} current={form.recomendaria} onChange={(v) => set('recomendaria', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="Calificación general del 1 al 10:">
            <div className="flex flex-wrap gap-2 pt-1">
              {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('calificacion', n)}
                  className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                    form.calificacion === n
                      ? 'bg-blue-800 text-white'
                      : 'border border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          <Field label="¿Qué debe mejorarse antes del lanzamiento comercial?">
            <textarea rows={3} value={form.mejoras} onChange={(e) => set('mejoras', e.target.value)} className={textareaCls} />
          </Field>

          <Field label="Comentarios adicionales:">
            <textarea rows={3} value={form.comentarios} onChange={(e) => set('comentarios', e.target.value)} className={textareaCls} />
          </Field>
        </SurfaceCard>

        {submitError && (
          <StatusBanner tone="error">{submitError}</StatusBanner>
        )}

        <button
          type="submit"
          disabled={sending}
          className="lex-button-primary w-full"
        >
          {sending ? 'Enviando...' : 'Enviar retroalimentación'}
        </button>
      </form>
    </PageShell>
  );
}
