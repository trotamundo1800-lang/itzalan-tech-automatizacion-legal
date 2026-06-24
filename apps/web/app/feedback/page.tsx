'use client';

import { useState } from 'react';

type FormData = {
  nombre: string;
  profesion: string;
  area: string;
  ciudad: string;
  fecha: string;
  facilUso: string;
  modulosUtiles: string[];
  moduloConfuso: string;
  problemaLogin: string;
  detalleLogin: string;
  clientesUtil: string;
  expedientesUtil: string;
  camposAgregar: string;
  documentosUtil: string;
  documentosFrecuentes: string;
  formatosPrimero: string;
  iaAyudo: string;
  iaClara: string;
  iaConsultas: string;
  iaConfianza: string;
  pagaria: string;
  planInteres: string;
  precioRazonable: string;
  funcionJustifica: string;
  erroresTecnicos: string;
  detalleErrores: string;
  dondeError: string;
  recomendaria: string;
  calificacion: string;
  mejoras: string;
  comentarios: string;
};

const INITIAL: FormData = {
  nombre: '', profesion: '', area: '', ciudad: '', fecha: '',
  facilUso: '', modulosUtiles: [], moduloConfuso: '', problemaLogin: '', detalleLogin: '',
  clientesUtil: '', expedientesUtil: '', camposAgregar: '',
  documentosUtil: '', documentosFrecuentes: '', formatosPrimero: '',
  iaAyudo: '', iaClara: '', iaConsultas: '', iaConfianza: '',
  pagaria: '', planInteres: '', precioRazonable: '', funcionJustifica: '',
  erroresTecnicos: '', detalleErrores: '', dondeError: '',
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

function Checkbox({ value, checked, onChange, label }: {
  value: string; checked: boolean; onChange: (v: string, c: boolean) => void; label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="checkbox"
        value={value}
        checked={checked}
        onChange={(e) => onChange(value, e.target.checked)}
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

const inputCls =
  'mt-1 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm focus:border-slate-900 focus:outline-none';

export default function FeedbackPage() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  function set(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleModulo(value: string, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      modulosUtiles: checked
        ? [...prev.modulosUtiles, value]
        : prev.modulosUtiles.filter((m) => m !== value),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production: POST form data to an API endpoint or forward to a third-party form service.
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
        <section className="mx-auto max-w-2xl rounded-[2rem] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-4xl">✅</p>
          <h1 className="mt-4 text-2xl font-bold">Gracias por su retroalimentación</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sus respuestas han sido registradas. Su opinión es clave para mejorar LEXIA / JURINEX IA antes
            del lanzamiento comercial.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-10">
        {/* Header */}
        <header className="rounded-[2rem] bg-slate-950 px-8 py-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Piloto</p>
          <h1 className="mt-3 text-3xl font-bold">Formulario de retroalimentación</h1>
          <p className="mt-1 text-sm text-slate-400">LEXIA / JURINEX IA</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Objetivo: conocer la experiencia de uso de los abogados participantes en el piloto,
            identificar mejoras necesarias y validar el interés comercial de la plataforma antes de su
            lanzamiento oficial.
          </p>
        </header>

        {/* S1 Datos generales */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 1 — Datos generales</h2>
          {(
            [
              ['nombre', 'Nombre completo'],
              ['profesion', 'Profesión'],
              ['area', 'Área principal de práctica legal'],
              ['ciudad', 'Ciudad'],
            ] as [keyof FormData, string][]
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                type="text"
                value={form[key] as string}
                onChange={(e) => set(key, e.target.value)}
                className={inputCls}
              />
            </Field>
          ))}
          <Field label="Fecha">
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => set('fecha', e.target.value)}
              className={inputCls}
            />
          </Field>
        </section>

        {/* S2 Experiencia general */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 2 — Experiencia general</h2>

          <Field label="¿La plataforma fue fácil de usar?">
            <div className="space-y-1">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="facilUso" value={v} current={form.facilUso} onChange={(v) => set('facilUso', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué módulo le pareció más útil? (puede marcar varios)">
            <div className="space-y-1">
              {['Clientes', 'Expedientes', 'Documentos legales', 'IA jurídica', 'Suscripciones', 'Dashboard', 'Otro'].map((m) => (
                <Checkbox key={m} value={m} checked={form.modulosUtiles.includes(m)} onChange={toggleModulo} label={m} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué módulo le pareció más confuso?">
            <input type="text" value={form.moduloConfuso} onChange={(e) => set('moduloConfuso', e.target.value)} className={inputCls} />
          </Field>

          <Field label="¿Tuvo problemas para registrarse o iniciar sesión?">
            <div className="space-y-1">
              {['Sí', 'No'].map((v) => (
                <Radio key={v} name="problemaLogin" value={v} current={form.problemaLogin} onChange={(v) => set('problemaLogin', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="Si tuvo problemas, descríbalos brevemente.">
            <textarea rows={3} value={form.detalleLogin} onChange={(e) => set('detalleLogin', e.target.value)} className={inputCls} />
          </Field>
        </section>

        {/* S3 Clientes y expedientes */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 3 — Clientes y expedientes</h2>

          <Field label="¿La gestión de clientes le parece útil para su práctica profesional?">
            <div className="space-y-1">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="clientesUtil" value={v} current={form.clientesUtil} onChange={(v) => set('clientesUtil', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿La gestión de expedientes cubre sus necesidades básicas?">
            <div className="space-y-1">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="expedientesUtil" value={v} current={form.expedientesUtil} onChange={(v) => set('expedientesUtil', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué campos o funciones agregaría en clientes o expedientes?">
            <textarea rows={3} value={form.camposAgregar} onChange={(e) => set('camposAgregar', e.target.value)} className={inputCls} />
          </Field>
        </section>

        {/* S4 Documentos */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 4 — Documentos legales</h2>

          <Field label="¿Los documentos o plantillas le parecen útiles?">
            <div className="space-y-1">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="documentosUtil" value={v} current={form.documentosUtil} onChange={(v) => set('documentosUtil', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué documentos legales utiliza con mayor frecuencia?">
            <textarea rows={3} value={form.documentosFrecuentes} onChange={(e) => set('documentosFrecuentes', e.target.value)} className={inputCls} />
          </Field>

          <Field label="¿Qué formatos deberían agregarse primero a la plataforma?">
            <textarea rows={3} value={form.formatosPrimero} onChange={(e) => set('formatosPrimero', e.target.value)} className={inputCls} />
          </Field>
        </section>

        {/* S5 IA jurídica */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 5 — IA jurídica</h2>

          {[
            ['iaAyudo', '¿La IA jurídica le ayudó en alguna tarea?'],
            ['iaClara', '¿Las respuestas fueron claras?'],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <div className="space-y-1">
                {['Sí', 'Parcialmente', 'No'].map((v) => (
                  <Radio key={v} name={key} value={v} current={form[key as keyof FormData] as string} onChange={(val) => set(key as keyof FormData, val)} label={v} />
                ))}
              </div>
            </Field>
          ))}

          <Field label="¿Qué tipo de consultas le gustaría realizar con IA jurídica?">
            <textarea rows={3} value={form.iaConsultas} onChange={(e) => set('iaConsultas', e.target.value)} className={inputCls} />
          </Field>

          <Field label="¿Confía en usar la IA como apoyo, revisando siempre el resultado antes de utilizarlo profesionalmente?">
            <div className="space-y-1">
              {['Sí', 'Parcialmente', 'No'].map((v) => (
                <Radio key={v} name="iaConfianza" value={v} current={form.iaConfianza} onChange={(v) => set('iaConfianza', v)} label={v} />
              ))}
            </div>
          </Field>
        </section>

        {/* S6 Suscripciones */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 6 — Suscripciones y precio</h2>

          <Field label="¿Pagaría por esta plataforma si mejora su trabajo profesional?">
            <div className="space-y-1">
              {['Sí', 'Tal vez', 'No'].map((v) => (
                <Radio key={v} name="pagaria" value={v} current={form.pagaria} onChange={(v) => set('pagaria', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué plan le interesaría?">
            <div className="space-y-1">
              {['Básico', 'Profesional', 'Empresarial', 'Aún no estoy seguro'].map((v) => (
                <Radio key={v} name="planInteres" value={v} current={form.planInteres} onChange={(v) => set('planInteres', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="¿Qué precio mensual considera razonable?">
            <input type="text" value={form.precioRazonable} onChange={(e) => set('precioRazonable', e.target.value)} className={inputCls} />
          </Field>

          <Field label="¿Qué función justificaría pagar una suscripción?">
            <textarea rows={3} value={form.funcionJustifica} onChange={(e) => set('funcionJustifica', e.target.value)} className={inputCls} />
          </Field>
        </section>

        {/* S7 Errores */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 7 — Errores o problemas</h2>

          <Field label="¿Encontró errores técnicos durante el uso?">
            <div className="space-y-1">
              {['Sí', 'No'].map((v) => (
                <Radio key={v} name="erroresTecnicos" value={v} current={form.erroresTecnicos} onChange={(v) => set('erroresTecnicos', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="Describa cualquier error encontrado.">
            <textarea rows={3} value={form.detalleErrores} onChange={(e) => set('detalleErrores', e.target.value)} className={inputCls} />
          </Field>

          <Field label="¿En qué parte ocurrió el error?">
            <input type="text" value={form.dondeError} onChange={(e) => set('dondeError', e.target.value)} className={inputCls} />
          </Field>
        </section>

        {/* S8 Recomendación */}
        <section className="space-y-5 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold">Sección 8 — Recomendación final</h2>

          <Field label="¿Recomendaría esta plataforma a otro abogado?">
            <div className="space-y-1">
              {['Sí', 'Tal vez', 'No'].map((v) => (
                <Radio key={v} name="recomendaria" value={v} current={form.recomendaria} onChange={(v) => set('recomendaria', v)} label={v} />
              ))}
            </div>
          </Field>

          <Field label="Del 1 al 10, ¿qué calificación le da a la plataforma?">
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
            <textarea rows={4} value={form.mejoras} onChange={(e) => set('mejoras', e.target.value)} className={inputCls} />
          </Field>

          <Field label="Comentarios adicionales.">
            <textarea rows={4} value={form.comentarios} onChange={(e) => set('comentarios', e.target.value)} className={inputCls} />
          </Field>
        </section>

        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Enviar retroalimentación
        </button>
      </form>
    </main>
  );
}
