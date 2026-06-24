import Link from 'next/link';

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <article className="mx-auto max-w-4xl space-y-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:p-10">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Legal</p>
          <h1 className="text-3xl font-bold">Terminos y Condiciones de Uso</h1>
          <p className="text-sm text-slate-600">Plataforma LEXIA / JURINEX IA</p>
          <div className="text-sm text-slate-600">
            <p>Fecha de vigencia: [●]</p>
            <p>Version: 1.0</p>
            <p>Titular de la plataforma: [Nombre legal de la empresa o titular]</p>
            <p>
              Sitio web:{' '}
              <Link href="https://app.lexialegal.com" className="font-semibold text-slate-900 underline">
                https://app.lexialegal.com
              </Link>
            </p>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Aceptacion de los terminos</h2>
          <p className="text-sm leading-6 text-slate-700">
            Al registrarse, acceder o utilizar la plataforma LEXIA / JURINEX IA, el usuario acepta estos Terminos y
            Condiciones de Uso. Si el usuario no esta de acuerdo, debera abstenerse de utilizar la plataforma.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Naturaleza del servicio</h2>
          <p className="text-sm leading-6 text-slate-700">
            LEXIA / JURINEX IA es una plataforma tecnologica orientada a apoyar a profesionales del derecho en la
            gestion de clientes, expedientes, documentos, agenda, analisis juridico asistido por inteligencia
            artificial y funcionalidades relacionadas.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            La plataforma no sustituye el criterio profesional del abogado, ni constituye por si misma asesoria legal
            definitiva para terceros. Todo resultado generado por la plataforma debe ser revisado, validado y aprobado
            por un profesional competente antes de su uso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Registro de cuenta</h2>
          <p className="text-sm leading-6 text-slate-700">
            Para utilizar determinadas funciones, el usuario debera crear una cuenta, proporcionar informacion veraz y
            mantener la confidencialidad de sus credenciales.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            El usuario sera responsable por toda actividad realizada desde su cuenta, salvo que demuestre uso no
            autorizado no imputable a negligencia propia.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Uso aceptable</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Cargar informacion falsa, ilicita, fraudulenta o que infrinja derechos de terceros.</li>
            <li>Utilizar la plataforma para actividades contrarias a la ley.</li>
            <li>Intentar vulnerar, copiar, alterar, descompilar o afectar el funcionamiento del sistema.</li>
            <li>Compartir credenciales con terceros no autorizados.</li>
            <li>
              Usar la inteligencia artificial para generar documentos destinados a enganar, falsificar, defraudar o
              perjudicar a terceros.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Documentos y contenido del usuario</h2>
          <p className="text-sm leading-6 text-slate-700">
            El usuario conserva la titularidad de los documentos, expedientes, datos y archivos que cargue en la
            plataforma.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            El usuario autoriza a la plataforma a procesar dicho contenido unicamente en la medida necesaria para
            prestar los servicios contratados, incluyendo almacenamiento, analisis, generacion de documentos y
            funcionalidades asistidas por inteligencia artificial.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Inteligencia artificial y limitacion de resultados</h2>
          <p className="text-sm leading-6 text-slate-700">
            Los analisis, respuestas, documentos o recomendaciones generadas por inteligencia artificial pueden contener
            errores, omisiones o interpretaciones incompletas.
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Debe revisar todo resultado antes de utilizarlo.</li>
            <li>La plataforma no garantiza resultados judiciales, administrativos o comerciales.</li>
            <li>La decision final corresponde exclusivamente al usuario profesional.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Planes, pagos y suscripciones</h2>
          <p className="text-sm leading-6 text-slate-700">
            La plataforma podra ofrecer planes gratuitos, basicos, profesionales o empresariales, con limites de uso,
            funciones y precios determinados.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            El pago de suscripciones estara sujeto a las condiciones publicadas al momento de contratacion. Las
            cancelaciones, renovaciones y cambios de plan se aplicaran conforme a las reglas visibles en la plataforma.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            Mientras la plataforma opere con checkout simulado o piloto, cualquier cobro real debera confirmarse por
            medios externos autorizados por el titular.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Disponibilidad del servicio</h2>
          <p className="text-sm leading-6 text-slate-700">
            La plataforma procurara mantener disponibilidad continua. Sin embargo, podran existir interrupciones por
            mantenimiento, actualizaciones, fallos tecnicos, proveedores externos, fuerza mayor o causas fuera del
            control razonable del titular.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            La plataforma no garantiza disponibilidad ininterrumpida ni ausencia absoluta de errores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Suspension o cierre de cuenta</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Incumplimiento de estos terminos.</li>
            <li>Uso abusivo o fraudulento.</li>
            <li>Riesgo para la seguridad del sistema.</li>
            <li>Falta de pago en planes contratados.</li>
            <li>Requerimiento legal o autoridad competente.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Propiedad intelectual</h2>
          <p className="text-sm leading-6 text-slate-700">
            La plataforma, marca, diseno, software, codigo, estructura, interfaz, bases de datos, textos comerciales y
            elementos tecnologicos pertenecen al titular o a sus licenciantes.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            El usuario no adquiere derechos de propiedad intelectual sobre la plataforma, salvo el derecho limitado de
            uso conforme al plan contratado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">11. Confidencialidad</h2>
          <p className="text-sm leading-6 text-slate-700">
            El titular adoptara medidas razonables para proteger la informacion cargada por los usuarios. El usuario
            reconoce que tambien debe aplicar buenas practicas de seguridad, incluyendo contrasenas fuertes, control de
            accesos y revision del contenido compartido.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">12. Limitacion de responsabilidad</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">
            <li>Uso incorrecto de documentos generados.</li>
            <li>Decisiones legales tomadas sin revision profesional.</li>
            <li>Perdidas derivadas de informacion incorrecta cargada por el usuario.</li>
            <li>Interrupciones temporales del servicio.</li>
            <li>Fallas de proveedores externos.</li>
            <li>Resultados adversos en procesos judiciales, administrativos o privados.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">13. Modificaciones</h2>
          <p className="text-sm leading-6 text-slate-700">
            El titular podra modificar estos terminos. Las modificaciones se publicaran con fecha de vigencia y version
            actualizada. El uso continuado de la plataforma implica aceptacion de la version vigente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">14. Jurisdiccion aplicable</h2>
          <p className="text-sm leading-6 text-slate-700">
            Estos terminos se regiran por las leyes de la Republica de Honduras, salvo que por la naturaleza del
            servicio, residencia del usuario o contratacion internacional resulte aplicable otra normativa obligatoria.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold">15. Contacto</h2>
          <p className="text-sm leading-6 text-slate-700">Correo: [●]</p>
          <p className="text-sm leading-6 text-slate-700">Telefono: [●]</p>
          <p className="text-sm leading-6 text-slate-700">Direccion: [●]</p>
        </section>
      </article>
    </main>
  );
}
