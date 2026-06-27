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

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'abogado' | 'asistente' | 'cliente'>('abogado');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <PageShell>
      <HeroPanel
        eyebrow="Onboarding"
        title="Registro de cuenta"
        description={<p>Crea tu cuenta para habilitar tu workspace jurídico y comenzar una operación legal centralizada.</p>}
      />

      <Card className="mx-auto w-full max-w-xl" title="Crear cuenta" subtitle="Configuración inicial para despachos y equipos legales.">
        <form
          className="mt-2 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();

            setLoading(true);
            setError('');

            try {
              const response = await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                  name: nombre.trim(),
                  email: correo.trim(),
                  password,
                  role,
                }),
              });

              if (!response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(parseApiError(data, 'No se pudo completar el registro.'));
              }

              const data = (await response.json()) as {
                accessToken?: string;
                refreshToken?: string;
              };

              if (!data.accessToken || !data.refreshToken) {
                throw new Error('Respuesta de registro inválida.');
              }

              localStorage.setItem('itzalanAccessToken', data.accessToken);
              localStorage.setItem('itzalanRefreshToken', data.refreshToken);
              window.dispatchEvent(new Event('authChange'));
              router.push('/dashboard');
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : 'No se pudo completar el registro.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <label className="lex-label">
            Nombre
            <input className="lex-input" value={nombre} onChange={(event) => setNombre(event.target.value)} required />
          </label>

          <label className="lex-label">
            Correo
            <input type="email" className="lex-input" value={correo} onChange={(event) => setCorreo(event.target.value)} required />
          </label>

          <label className="lex-label">
            Teléfono
            <input className="lex-input" value={telefono} onChange={(event) => setTelefono(event.target.value)} required />
          </label>

          <label className="lex-label">
            Contraseña
            <input type="password" className="lex-input" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>

          <label className="lex-label">
            Tipo de usuario
            <select className="lex-input" value={role} onChange={(event) => setRole(event.target.value as 'admin' | 'abogado' | 'asistente' | 'cliente')} required>
              <option value="abogado">Abogado</option>
              <option value="asistente">Asistente</option>
              <option value="admin">Administrador</option>
              <option value="cliente">Cliente</option>
            </select>
          </label>

          <button type="submit" className="lex-button-primary w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          {error ? <p className="lex-notice-error">{error}</p> : null}
        </form>

        <p className="mt-5 text-sm text-slate-300">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-amber-300">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </PageShell>
  );
}