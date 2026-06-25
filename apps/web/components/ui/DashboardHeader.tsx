'use client';

import { Bell, Search, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getProfile } from '../../lib/demoData';

export function DashboardHeader() {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getProfile>> | null>(null);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  useEffect(() => {
    void (async () => {
      setProfile(await getProfile());
    })();
  }, []);

  if (!profile) {
    return (
      <header className="sticky top-[86px] z-30 lex-gradient-frame p-4 backdrop-blur">
        <div className="text-sm text-slate-300">Cargando perfil...</div>
      </header>
    );
  }

  return (
    <header className="sticky top-[86px] z-30 lex-gradient-frame p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[15rem] flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Workspace jurídico</p>
          <div className="mt-2 flex items-center gap-3">
            <label className="flex min-w-[15rem] flex-1 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/65 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                placeholder="Buscar clientes, expedientes o documentos"
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </label>
            <span className="hidden rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 lg:inline-flex">
              Operación en línea
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-slate-700 bg-slate-950/75 p-2 text-slate-300 transition hover:border-blue-700/60 hover:text-slate-50"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-xl border border-slate-700 bg-slate-950/75 p-2 text-slate-300 transition hover:border-blue-700/60 hover:text-slate-50"
          >
            <Settings className="h-4 w-4" />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenUserMenu((current) => !current)}
              className="rounded-xl border border-slate-700 bg-slate-950/75 px-3 py-2 text-left text-sm text-slate-100"
            >
              <span className="block text-xs text-slate-400">{profile.tipoUsuario}</span>
              <span className="block font-semibold">{profile.nombre}</span>
            </button>
            {openUserMenu ? (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl">
                <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">
                  Perfil
                </button>
                <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800">
                  Preferencias
                </button>
                <button type="button" className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-800">
                  Cerrar menú
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
