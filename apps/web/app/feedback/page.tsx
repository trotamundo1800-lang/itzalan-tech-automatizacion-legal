'use client';

import { useState } from 'react';
import { API_BASE_URL } from '../lib/api';

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
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="accent-slate-900"
      />
      {label}
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-800">{label}</p>
      {children}
    </div>
  );
}

const inputCls = 'mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none';
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
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-4xl">✅</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Gracias por su retroalimentación</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sus respuestas han sido registradas. Su opinión es clave para mejorar LEXIA / JURINEX IA
            antes del lanzamiento comercial.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8">

        {/* Header */}
        <header className="rounded-[2rem] bg-slate-950 px-8 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Piloto</p>
          <h1 className="mt-3 text-3xl font-bold">Formulario breve de retroalimentación</h1>
          <p className="mt-1 text-sm text-slate-400">LEXIA / JURINEX IA</p>
        </header>

        {/* Datos generales */}
        <section className="space-y-4 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Datos generales</h2>
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
        </section>

        {/* S1 Experiencia general */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">1. Experiencia general</h2>

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
        </section>

        {/* S2 Clientes, expedientes y documentos */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">2. Clientes, expedientes y documentos</h2>

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
        </section>

        {/* S3 IA jurídica */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">3. IA jurídica</h2>

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
        </section>

        {/* S4 Suscripciones y precio */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">4. Suscripciones y precio</h2>

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
        </section>

        {/* S5 Recomendación final */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">5. Recomendación final</h2>

          <Field label="¿Recomendaría LEXIA / JURINEX IA a otro abogado?">
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
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-300 text-slate-700 hover:border-slate-500'
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
        </section>

        {submitError && (
          <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? 'Enviando...' : 'Enviar retroalimentación'}
        </button>
      </form>
    </main>
  );
}
