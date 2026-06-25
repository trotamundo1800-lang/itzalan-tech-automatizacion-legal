'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  Briefcase,
  CalendarDays,
  CreditCard,
  FileText,
  Settings,
  Users,
} from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Panel principal', icon: BarChart3 },
  { href: '/dashboard/clientes', label: 'Clientes', icon: Users },
  { href: '/dashboard/expedientes', label: 'Expedientes', icon: Briefcase },
  { href: '/dashboard/documentos', label: 'Documentos', icon: FileText },
  { href: '/dashboard/ia', label: 'IA Jurídica', icon: Bot },
  { href: '/dashboard/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/dashboard/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="lex-gradient-frame p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.95)]">
      <div className="mb-4 rounded-xl border border-slate-700 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">LEXIA Legal IA</p>
        <p className="mt-2 text-sm text-slate-200">Operación jurídica empresarial</p>
        <p className="mt-2 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
          Entorno activo
        </p>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                active
                  ? 'border-blue-700/80 bg-blue-900/30 text-slate-50'
                  : 'border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/55 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Accesos rápidos</p>
        <div className="mt-2 flex flex-col gap-1 text-sm text-slate-300">
          <Link href="/dashboard/documentos" className="rounded-lg px-2 py-1.5 transition hover:bg-slate-800 hover:text-slate-100">
            Nuevo documento
          </Link>
          <Link href="/dashboard/ia" className="rounded-lg px-2 py-1.5 transition hover:bg-slate-800 hover:text-slate-100">
            Consulta IA
          </Link>
          <Link href="/dashboard/agenda" className="rounded-lg px-2 py-1.5 transition hover:bg-slate-800 hover:text-slate-100">
            Gestionar agenda
          </Link>
        </div>
      </div>
    </aside>
  );
}
