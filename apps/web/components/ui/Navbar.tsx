'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../app/lib/api';

export function Navbar() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const updateAuthState = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
      setAuthenticated(Boolean(token));
    };

    updateAuthState();
    window.addEventListener('authChange', updateAuthState);
    return () => window.removeEventListener('authChange', updateAuthState);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('itzalanRefreshToken');
      if (refreshToken) {
        try {
          await apiFetch('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
          });
        } catch {
          // ignore logout failure and clear local state anyway
        }
      }

      localStorage.removeItem('itzalanAccessToken');
      localStorage.removeItem('itzalanRefreshToken');
      window.dispatchEvent(new Event('authChange'));
    }
    setAuthenticated(false);
    router.push('/login');
    setLoggingOut(false);
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-700/80 bg-slate-950/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-slate-100">
            <img
              src="/brand/itzalan-mark.svg"
              alt="ITZALAN TECH"
              className="h-10 w-10 rounded-lg border border-slate-700 bg-slate-900 p-1"
            />
            <span className="space-y-1">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Automatización legal</span>
              <span className="block text-lg font-bold">ITZALAN TECH</span>
            </span>
          </Link>
          <span className="hidden rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300 sm:inline-flex">
            Suite activa
          </span>
          <div className="hidden h-10 w-px bg-slate-700 lg:block" />
          <p className="hidden max-w-xs text-sm leading-6 text-slate-400 lg:block">
            Suite jurídica para expedientes, automatización documental y analítica asistida por IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-300">
          <Link href="/servicios" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
            Servicios
          </Link>
          <Link href="/planes" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
            Planes
          </Link>
          <Link href="/contacto" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
            Contacto
          </Link>
          <Link href="/ia-juridica" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
            IA Jurídica
          </Link>
          <Link href="/manual" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
            Manual
          </Link>
          <Link href="/feedback" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
            Feedback
          </Link>
          <Link href="/suscripciones" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
            Suscripciones
          </Link>
          {!authenticated ? (
            <>
              <Link href="/login" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
                Login
              </Link>
              <Link href="/registro" className="lex-button-primary px-4 py-2.5 text-xs sm:text-sm">
                Regístrate
              </Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="rounded-xl border border-transparent px-3 py-2 font-medium transition hover:border-slate-700 hover:bg-slate-800 hover:text-slate-50">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-slate-100 transition hover:border-slate-600 hover:bg-slate-700"
              >
                {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
