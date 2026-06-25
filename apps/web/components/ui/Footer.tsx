import Link from 'next/link';

export function Footer() {
  return (
    <footer className="px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[1.4rem] border border-slate-700 bg-slate-900/70 px-6 py-8 shadow-[0_25px_50px_-40px_rgba(0,0,0,0.9)] backdrop-blur sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <span className="lex-pill">Marco legal y soporte</span>
            <div>
              <p className="text-lg font-bold text-slate-50">ITZALAN TECH</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
                Plataforma LegalTech para despachos y abogados que necesitan operar con trazabilidad,
                automatización documental y una experiencia digital confiable.
              </p>
            </div>
            <p className="text-sm text-slate-400">© {new Date().getFullYear()} ITZALAN TECH. Todos los derechos reservados.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Legal</p>
              <div className="flex flex-col gap-2 text-sm text-slate-300">
                <Link href="/terminos" className="transition hover:text-white">
                  Términos
                </Link>
                <Link href="/privacidad" className="transition hover:text-white">
                  Privacidad
                </Link>
                <Link href="/manual" className="transition hover:text-white">
                  Manual
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Producto</p>
              <div className="flex flex-col gap-2 text-sm text-slate-300">
                <Link href="/feedback" className="transition hover:text-white">
                  Retroalimentación
                </Link>
                <Link href="/suscripciones" className="transition hover:text-white">
                  Suscripciones
                </Link>
                <Link href="/login" className="transition hover:text-white">
                  Acceso seguro
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
