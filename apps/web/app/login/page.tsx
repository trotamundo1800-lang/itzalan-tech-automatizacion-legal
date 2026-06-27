'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, HeroPanel, PageShell } from '../../components/ui';
import { apiFetch } from '../lib/api';

function parseApiError(data: unknown, fallback: string) {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message;
    if (Array.isArray(message)) return message[0] ?? fallback;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <PageShell>
      <HeroPanel
        eyebrow="Acceso seguro"
        title="Iniciar sesión"
        description={<p>Accede al workspace jurídico para gestionar clientes, expedientes, documentos e IA en un entorno unificado.</p>}
      />

      <Card className="mx-auto w-full max-w-xl" title="Acceso a la plataforma" subtitle="Autenticación segura para usuarios autorizados.">
        <form
          className="mt-2 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();

            setLoading(true);
            setError('');

            try {
              const response = await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: correo.trim(), password }),
              });

              if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(parseApiError(data, 'No se pudo iniciar sesión.'));
              }

              const data = (await response.json()) as {
                accessToken?: string;
                refreshToken?: string;
              };

              if (!data.accessToken || !data.refreshToken) {
                throw new Error('Respuesta de autenticación inválida.');
              }

              localStorage.setItem('itzalanAccessToken', data.accessToken);
              localStorage.setItem('itzalanRefreshToken', data.refreshToken);
              window.dispatchEvent(new Event('authChange'));
              router.push('/dashboard');
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="lex-label">
            Correo
            <input type="email" className="lex-input" value={correo} onChange={(event) => setCorreo(event.target.value)} required />
          </label>

          <label className="lex-label">
            Contraseña
            <input type="password" className="lex-input" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          <button type="submit" className="lex-button-primary w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          {error ? <p className="lex-notice-error">{error}</p> : null}
        </form>

        <p className="mt-5 text-sm text-slate-300">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="font-semibold text-amber-300">
            Regístrate
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}
