export default function ManualPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <article className="mx-auto max-w-5xl space-y-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:p-10">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Comercial y onboarding</p>
          <h1 className="text-3xl font-bold">Guion de Demo Comercial e Indice del Manual</h1>
          <p className="text-sm text-slate-600">LEXIA / JURINEX IA</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">A. Guion de demo comercial de 15 minutos</h2>
          <p className="text-sm leading-6 text-slate-700">
            Objetivo: demostrar a abogados y despachos como LEXIA / JURINEX IA reduce tiempo operativo, organiza
            expedientes, genera documentos y apoya el analisis juridico con inteligencia artificial.
          </p>
          <p className="text-sm leading-6 text-slate-700">Duracion total sugerida: 15 a 20 minutos.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">1. Apertura - 2 minutos</h3>
          <p className="text-sm leading-6 text-slate-700">
            "Hoy los abogados pierden mucho tiempo en tareas repetitivas: buscar formatos, ordenar expedientes,
            redactar documentos, revisar informacion de clientes, controlar audiencias y responder consultas basicas.
            LEXIA / JURINEX IA nace para centralizar esas tareas en una sola plataforma profesional."
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Plataforma para abogados.</li>
            <li>Gestion de clientes y expedientes.</li>
            <li>Documentos legales.</li>
            <li>IA juridica.</li>
            <li>Suscripciones y acceso premium.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">2. Problema actual - 3 minutos</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Expedientes en carpetas o archivos dispersos.</li>
            <li>Documentos en Word sin control.</li>
            <li>Clientes sin seguimiento ordenado.</li>
            <li>Perdida de tiempo redactando desde cero.</li>
            <li>Falta de control de plazos.</li>
            <li>Investigacion juridica lenta.</li>
          </ol>
          <p className="text-sm leading-6 text-slate-700 font-medium">
            "LEXIA no reemplaza al abogado; le da una oficina digital inteligente para trabajar mas rapido y con mas
            control."
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">3. Demo live - 8 a 10 minutos</h3>
          <div className="space-y-3 text-sm leading-6 text-slate-700">
            <p>
              <span className="font-semibold">3.1 Login y dashboard:</span> inicio de sesion, panel principal y
              navegacion general.
            </p>
            <p>
              <span className="font-semibold">3.2 Clientes:</span> crear cliente, ver listado y asociar cliente con
              expediente.
            </p>
            <p>
              <span className="font-semibold">3.3 Expedientes:</span> crear expediente, estado del expediente e
              informacion basica del caso.
            </p>
            <p>
              <span className="font-semibold">3.4 Documentos:</span> generacion o gestion de documento, plantillas
              legales y resultado editable.
            </p>
            <p>
              <span className="font-semibold">3.5 IA juridica:</span> consulta juridica, analisis de texto o caso y
              resultado generado.
            </p>
            <p>
              <span className="font-semibold">3.6 Suscripciones:</span> planes, funciones premium y checkout simulado.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">4. ROI estimado - 3 minutos</h3>
          <p className="text-sm leading-6 text-slate-700">
            "Si un abogado ahorra entre 30 y 60 minutos diarios en redaccion, busqueda y organizacion, puede recuperar
            varias horas semanales. Eso se traduce en mas casos atendidos, mejor seguimiento y mejor experiencia para
            el cliente."
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Ahorro de tiempo.</li>
            <li>Mejor organizacion.</li>
            <li>Mas control.</li>
            <li>Mejor imagen profesional.</li>
            <li>Potencial de ingresos recurrentes para despachos.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">5. Cierre - 2 minutos</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Que tarea le consume mas tiempo actualmente?</li>
            <li>Que documentos redacta con mayor frecuencia?</li>
            <li>Que modulo le gustaria probar primero?</li>
            <li>Aceptaria participar como usuario piloto?</li>
          </ol>
          <p className="text-sm leading-6 text-slate-700 font-medium">
            "Estamos abriendo un grupo piloto limitado para abogados y despachos que quieran probar la plataforma,
            darnos retroalimentacion y acceder a condiciones preferenciales de lanzamiento."
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-2xl font-semibold">B. Indice completo del manual basico para abogados</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Portada (nombre, version, fecha y contacto de soporte).</li>
            <li>Introduccion (que es la plataforma, alcance y limites de la IA).</li>
            <li>
              Primeros 30 minutos: crear cuenta, login, dashboard, primer cliente, primer expediente, documentos, IA y
              suscripciones.
            </li>
            <li>Gestion de cuenta (registro, login, recuperacion, perfil, seguridad y logout).</li>
            <li>Dashboard (vista general, accesos rapidos, indicadores y navegacion).</li>
            <li>Clientes (alta, edicion, historial, buenas practicas y proteccion de datos).</li>
            <li>Expedientes (creacion, asociacion, estados y organizacion).</li>
            <li>Documentos legales (plantillas, edicion, descarga y recomendaciones).</li>
            <li>IA juridica (alcance, limites, prompts y revision profesional).</li>
            <li>Suscripciones (planes, limites, premium, cancelacion y soporte).</li>
            <li>Seguridad y confidencialidad para despachos.</li>
            <li>Errores comunes y soluciones.</li>
            <li>Preguntas frecuentes.</li>
            <li>Soporte (correo, WhatsApp, horarios y tiempos de respuesta).</li>
          </ol>
        </section>
      </article>
    </main>
  );
}
