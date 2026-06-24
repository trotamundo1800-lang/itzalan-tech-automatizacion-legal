import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white/80 px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} ITZALAN TECH. Plataforma LegalTech.</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/terminos" className="hover:text-slate-900">
            Términos
          </Link>
          <Link href="/privacidad" className="hover:text-slate-900">
            Privacidad
          </Link>
          <Link href="/manual" className="hover:text-slate-900">
            Manual
          </Link>
          <Link href="/feedback" className="hover:text-slate-900">
            Retroalimentación
          </Link>
        </div>
      </div>
    </footer>
  );
}