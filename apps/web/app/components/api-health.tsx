'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

type HealthState =
  | { status: 'loading'; message: string }
  | { status: 'ok'; message: string }
  | { status: 'error'; message: string };

export function ApiHealth() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading', message: 'Verificando API...' });

  useEffect(() => {
    async function loadHealth() {
      try {
        const response = await apiFetch('/');
        if (!response.ok) {
          throw new Error('Sin respuesta válida');
        }

        const data = (await response.json()) as { status?: string; message?: string };
        setHealth({
          status: data.status === 'ok' ? 'ok' : 'error',
          message: data.message || 'Estado de API recibido',
        });
      } catch {
        setHealth({ status: 'error', message: 'API no disponible' });
      }
    }

    loadHealth();
  }, []);

  const tone =
    health.status === 'ok'
      ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
      : health.status === 'error'
        ? 'bg-red-500/20 text-red-200 border-red-400/30'
        : 'bg-slate-500/20 text-slate-200 border-slate-600/40';

  return (
    <div className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase ${tone}`}>
      API: {health.message}
    </div>
  );
}
