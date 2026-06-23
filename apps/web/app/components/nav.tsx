'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';

export default function Nav() {
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
    <nav className="flex items-center justify-between rounded-3xl bg-white px-6 py-4 shadow-sm">
      <Link href="/" className="text-lg font-bold text-slate-900">
        ITZALAN TECH
      </Link>
      <div className="flex gap-4 text-sm text-slate-600">
        {!authenticated ? (
          <>
            <Link href="/login" className="hover:text-slate-900">
              Login
            </Link>
            <Link href="/registro" className="hover:text-slate-900">
              Regístrate
            </Link>
          </>
        ) : (
          <>
            <Link href="/dashboard" className="hover:text-slate-900">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-200"
            >
              {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
