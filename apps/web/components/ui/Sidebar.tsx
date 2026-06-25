'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Panel principal' },
  { href: '/dashboard/clientes', label: 'Clientes' },
  { href: '/dashboard/expedientes', label: 'Expedientes' },
  { href: '/dashboard/documentos', label: 'Documentos' },
  { href: '/dashboard/ia', label: 'IA Jurídica' },
  { href: '/dashboard/agenda', label: 'Agenda procesal' },
  { href: '/dashboard/pagos', label: 'Pagos y suscripciones' },
  { href: '/dashboard/configuracion', label: 'Configuración' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-[1.1rem] border border-slate-700 bg-slate-900/70 p-4">
      <p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Módulos</p>
      <nav className="mt-3 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`lex-sidebar-link ${active ? 'lex-sidebar-link-active' : ''}`.trim()}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
