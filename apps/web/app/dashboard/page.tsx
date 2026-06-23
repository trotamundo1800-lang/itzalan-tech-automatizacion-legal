'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';

type Profile = {
  email: string;
  name: string;
  role: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('itzalanAccessToken') : null;
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('itzalanRefreshToken') : null;

    if (!token || !refreshToken) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('itzalanAccessToken');
        localStorage.removeItem('itzalanRefreshToken');
      }
      router.push('/login');
      return;
    }

    const fetchProfile = async (accessToken: string) => {
      const response = await apiFetch('/auth/profile', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('No autorizado');
      }

      return response.json();
    };

    const refreshTokens = async () => {
      const response = await apiFetch('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh token inválido');
      }

      return response.json();
    };

    const loadProfile = async () => {
      try {
        const data = await fetchProfile(token);
        setProfile(data);
        setError('');
      } catch {
        try {
          const tokenData = await refreshTokens();
          localStorage.setItem('itzalanAccessToken', tokenData.accessToken);
          if (tokenData.refreshToken) {
            localStorage.setItem('itzalanRefreshToken', tokenData.refreshToken);
          }
          const refreshedProfile = await fetchProfile(tokenData.accessToken);
          setProfile(refreshedProfile);
        } catch {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('itzalanAccessToken');
            localStorage.removeItem('itzalanRefreshToken');
          }
          router.push('/login');
          setError('Tu sesión expiró, vuelve a iniciar sesión.');
        }
      }
    };

    loadProfile();
  }, [router]);

  return (
    <section className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="rounded-3xl bg-white p-8 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Principal</h1>
              <p className="mt-2 text-slate-600">Resumen de casos, actividades y métricas legales.</p>
            </div>
            {profile ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-700">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Usuario</p>
                <p className="mt-2 font-semibold text-slate-900">{profile.name}</p>
                <p className="text-sm text-slate-600">{profile.email}</p>
                <p className="text-sm text-slate-600">Rol: {profile.role}</p>
              </div>
            ) : (
              <p className="text-slate-500">Cargando perfil...</p>
            )}
          </div>
        </header>

        {error && <p className="rounded-3xl bg-red-50 p-4 text-red-700 shadow-sm">{error}</p>}

        <div className="grid gap-6 xl:grid-cols-3">
          {[
            { title: 'Casos activos', value: '12' },
            { title: 'Audiencias próximas', value: '4' },
            { title: 'Clientes registrados', value: '86' },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.title}</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Actividades pendientes</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>Revisión de expediente de cliente ABC</li>
              <li>Generar contrato para caso de compraventa</li>
              <li>Enviar recordatorio de audiencia</li>
            </ul>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Notificaciones</h2>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>Vencimiento de plazo procesal en 2 días</li>
              <li>Solicitud de cita de cliente María López</li>
              <li>Nuevo documento cargado al expediente 0912</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
