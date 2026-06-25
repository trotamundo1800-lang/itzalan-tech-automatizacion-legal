import { HeroPanel, PageShell, SurfaceCard } from '../../components/ui';

export default function ManualPage() {
  return (
    <PageShell>
      <HeroPanel
        eyebrow="Comercial y onboarding"
        title="Guion de demo comercial e indice del manual para una presentación jurídica más profesional."
        description={
          <>
            <p>Este material organiza la narrativa comercial, el flujo de demo y la estructura del manual base para despachos y abogados.</p>
            <p>La meta es transmitir valor, control y criterio profesional desde la primera presentación.</p>
          </>
        }
        aside={
          <div className="space-y-3 text-sm text-slate-200">
            <p className="font-semibold text-white">Uso recomendado</p>
            <p className="text-slate-300">Acompañar demos, pilotos y procesos de onboarding con un discurso unificado y claro.</p>
          </div>
        }
      />

      <article className="mx-auto max-w-5xl space-y-8 rounded-[1.4rem] border border-slate-700 bg-slate-900/90 p-6 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8 lg:p-10">

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">A. Guion de demo comercial de 15 minutos</h2>
          <p className="text-sm leading-6 text-slate-300">
            Objetivo: demostrar a abogados y despachos como la plataforma reduce tiempo operativo, organiza
            expedientes, genera documentos y apoya el analisis juridico con inteligencia artificial.
          </p>
          <p className="text-sm leading-6 text-slate-300">Duracion total sugerida: 15 a 20 minutos.</p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">1. Apertura - 2 minutos</h3>
          <p className="text-sm leading-6 text-slate-300">
            "Hoy los abogados pierden mucho tiempo en tareas repetitivas: buscar formatos, ordenar expedientes,
            redactar documentos, revisar informacion de clientes, controlar audiencias y responder consultas basicas.
            La plataforma nace para centralizar esas tareas en una sola experiencia profesional."
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">
            <li>Plataforma para abogados.</li>
            <li>Gestion de clientes y expedientes.</li>
            <li>Documentos legales.</li>
            <li>IA juridica.</li>
            <li>Suscripciones y acceso premium.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">2. Problema actual - 3 minutos</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">
            <li>Expedientes en carpetas o archivos dispersos.</li>
            <li>Documentos en Word sin control.</li>
            <li>Clientes sin seguimiento ordenado.</li>
            <li>Perdida de tiempo redactando desde cero.</li>
            <li>Falta de control de plazos.</li>
            <li>Investigacion juridica lenta.</li>
          </ol>
          <p className="text-sm leading-6 text-slate-200 font-medium">
            "La plataforma no reemplaza al abogado; le da una oficina digital inteligente para trabajar mas rapido y con mas
            control."
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">3. Demo live - 8 a 10 minutos</h3>
          <div className="space-y-3 text-sm leading-6 text-slate-300">
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
          <p className="text-sm leading-6 text-slate-300">
            "Si un abogado ahorra entre 30 y 60 minutos diarios en redaccion, busqueda y organizacion, puede recuperar
            varias horas semanales. Eso se traduce en mas casos atendidos, mejor seguimiento y mejor experiencia para
            el cliente."
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">
            <li>Ahorro de tiempo.</li>
            <li>Mejor organizacion.</li>
            <li>Mas control.</li>
            <li>Mejor imagen profesional.</li>
            <li>Potencial de ingresos recurrentes para despachos.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h3 className="text-xl font-semibold">5. Cierre - 2 minutos</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-300">
            <li>Que tarea le consume mas tiempo actualmente?</li>
            <li>Que documentos redacta con mayor frecuencia?</li>
            <li>Que modulo le gustaria probar primero?</li>
            <li>Aceptaria participar como usuario piloto?</li>
          </ol>
          <p className="text-sm leading-6 text-slate-200 font-medium">
            "Estamos abriendo un grupo piloto limitado para abogados y despachos que quieran probar la plataforma,
            darnos retroalimentacion y acceder a condiciones preferenciales de lanzamiento."
          </p>
        </section>

        <SurfaceCard muted className="space-y-3 border-t border-slate-700 pt-6 shadow-none">
          <h2 className="text-2xl font-semibold">B. Indice completo del manual basico para abogados</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">
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
        </SurfaceCard>
      </article>
    </PageShell>
  );
}
