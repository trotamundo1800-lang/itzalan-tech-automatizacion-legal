import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <article className="mx-auto max-w-4xl space-y-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200 lg:p-10">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Legal</p>
          <h1 className="text-3xl font-bold">Politica de Privacidad</h1>
          <p className="text-sm text-slate-600">Plataforma LEXIA / JURINEX IA</p>
          <div className="text-sm text-slate-600">
            <p>Fecha de vigencia: [●]</p>
            <p>Version: 1.0</p>
            <p>
              Sitio web:{' '}
              <Link href="https://app.lexialegal.com" className="font-semibold text-slate-900 underline">
                https://app.lexialegal.com
              </Link>
            </p>
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Responsable del tratamiento</h2>
          <p className="text-sm leading-6 text-slate-700">
            El responsable del tratamiento de los datos personales sera:
          </p>
          <p className="text-sm leading-6 text-slate-700">Titular: [Nombre legal de la empresa o titular]</p>
          <p className="text-sm leading-6 text-slate-700">Correo de contacto: [●]</p>
          <p className="text-sm leading-6 text-slate-700">Direccion: [●]</p>
          <p className="text-sm leading-6 text-slate-700">
            Esta Politica de Privacidad explica como se recopilan, utilizan, almacenan, protegen y comparten los datos
            personales tratados mediante la plataforma LEXIA / JURINEX IA.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Datos que recopilamos</h2>

          <div className="space-y-2">
            <h3 className="font-semibold">2.1 Datos de cuenta</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
              <li>Nombre.</li>
              <li>Correo electronico.</li>
              <li>Telefono.</li>
              <li>Contrasena cifrada.</li>
              <li>Datos de perfil profesional.</li>
              <li>Plan contratado.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2.2 Datos de uso</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
              <li>Fecha y hora de acceso.</li>
              <li>Funciones utilizadas.</li>
              <li>Actividad dentro de la plataforma.</li>
              <li>Registros tecnicos.</li>
              <li>Direccion IP.</li>
              <li>Informacion del navegador o dispositivo.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2.3 Datos legales cargados por el usuario</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
              <li>Clientes.</li>
              <li>Expedientes.</li>
              <li>Contratos.</li>
              <li>Documentos legales.</li>
              <li>Notas internas.</li>
              <li>Informacion procesal.</li>
              <li>Archivos o textos enviados para analisis.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">2.4 Datos de pago</h3>
            <p className="text-sm leading-6 text-slate-700">
              Cuando se habiliten pagos reales, podran tratarse datos relacionados con suscripciones, transacciones,
              confirmaciones, estado de pago y referencias de pasarelas externas. La plataforma no debera almacenar
              datos completos de tarjetas si utiliza proveedores externos autorizados.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Finalidades del tratamiento</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Crear y administrar cuentas de usuario.</li>
            <li>Permitir acceso seguro a la plataforma.</li>
            <li>Gestionar clientes, expedientes y documentos.</li>
            <li>Generar documentos legales.</li>
            <li>Procesar consultas de inteligencia artificial.</li>
            <li>Administrar planes y suscripciones.</li>
            <li>Prestar soporte tecnico.</li>
            <li>Mejorar la seguridad y estabilidad del servicio.</li>
            <li>Cumplir obligaciones legales o requerimientos de autoridad competente.</li>
            <li>Elaborar metricas internas de uso y mejora del producto.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Base de tratamiento</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Consentimiento del usuario al registrarse y utilizar la plataforma.</li>
            <li>Ejecucion de la relacion contractual o precontractual.</li>
            <li>Interes legitimo en mantener la seguridad, calidad y continuidad del servicio.</li>
            <li>Cumplimiento de obligaciones legales aplicables.</li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Transferencias a terceros</h2>
          <p className="text-sm leading-6 text-slate-700">
            Para prestar el servicio, la plataforma podra utilizar proveedores tecnologicos, entre ellos:
          </p>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Vercel, para alojamiento del frontend.</li>
            <li>Render, para alojamiento del backend.</li>
            <li>Neon, para base de datos PostgreSQL.</li>
            <li>OpenAI u otro proveedor de inteligencia artificial, para procesamiento de solicitudes de IA.</li>
            <li>Pasarelas de pago como PayPal o Stripe, cuando se habiliten pagos reales.</li>
            <li>Servicios de monitoreo, analitica o soporte tecnico.</li>
          </ol>
          <p className="text-sm leading-6 text-slate-700">
            Estos proveedores solo deberan tratar datos en la medida necesaria para prestar el servicio
            correspondiente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Inteligencia artificial y documentos legales</h2>
          <p className="text-sm leading-6 text-slate-700">
            Cuando el usuario utilice funciones de IA, los textos, documentos o instrucciones enviados podran ser
            procesados por proveedores externos de inteligencia artificial para generar respuestas, analisis o
            documentos.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            El usuario debe evitar cargar informacion innecesaria, excesiva o altamente sensible cuando no sea
            indispensable para el analisis solicitado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Conservacion de datos</h2>
          <p className="text-sm leading-6 text-slate-700">
            Los datos se conservaran mientras la cuenta este activa o mientras sean necesarios para la prestacion del
            servicio, cumplimiento legal, auditoria, seguridad o defensa de derechos.
          </p>
          <p className="text-sm leading-6 text-slate-700">
            El usuario podra solicitar eliminacion de su cuenta o datos, sujeto a obligaciones legales, contractuales o
            tecnicas aplicables.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Seguridad</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Control de acceso por usuario.</li>
            <li>Contrasenas cifradas.</li>
            <li>Uso de conexiones seguras HTTPS.</li>
            <li>Variables secretas protegidas.</li>
            <li>Restriccion de accesos internos.</li>
            <li>Monitoreo de errores.</li>
            <li>Backups de base de datos cuando esten habilitados.</li>
          </ol>
          <p className="text-sm leading-6 text-slate-700">
            Ningun sistema es absolutamente infalible, por lo que el usuario tambien debe proteger sus credenciales y
            dispositivos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Derechos del usuario</h2>
          <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-slate-700">
            <li>Acceso a sus datos.</li>
            <li>Rectificacion de datos incorrectos.</li>
            <li>Actualizacion de informacion.</li>
            <li>Eliminacion cuando proceda.</li>
            <li>Limitacion u oposicion al tratamiento cuando sea aplicable.</li>
            <li>Informacion sobre el uso de sus datos.</li>
          </ol>
          <p className="text-sm leading-6 text-slate-700">Correo para solicitudes: [●]</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Confidencialidad profesional</h2>
          <p className="text-sm leading-6 text-slate-700">
            La plataforma esta orientada a usuarios del sector legal. El usuario es responsable de cumplir sus deberes
            profesionales de confidencialidad, secreto profesional y manejo adecuado de expedientes o informacion de
            clientes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">11. Menores de edad</h2>
          <p className="text-sm leading-6 text-slate-700">
            La plataforma esta dirigida a profesionales, empresas o usuarios mayores de edad. No esta disenada para uso
            directo por menores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">12. Cambios a esta politica</h2>
          <p className="text-sm leading-6 text-slate-700">
            El titular podra actualizar esta Politica de Privacidad. Toda modificacion sera publicada con fecha de
            vigencia y numero de version.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-xl font-semibold">13. Contacto</h2>
          <p className="text-sm leading-6 text-slate-700">Correo: [●]</p>
          <p className="text-sm leading-6 text-slate-700">Telefono: [●]</p>
          <p className="text-sm leading-6 text-slate-700">Direccion: [●]</p>
        </section>
      </article>
    </main>
  );
}
