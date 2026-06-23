'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '../lib/api';
import { validateEmail, validatePassword } from '../lib/auth-validation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('itzalanAccessToken')) {
      router.push('/dashboard');
    }
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(Array.isArray(data.message) ? data.message[0] : data.message || 'Credenciales inválidas');
        return;
      }

      const data = await response.json();
      localStorage.setItem('itzalanAccessToken', data.accessToken);
      localStorage.setItem('itzalanRefreshToken', data.refreshToken);
      window.dispatchEvent(new Event('authChange'));
      router.push('/dashboard');
    } catch {
      setError('No se pudo conectar con la API');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-2 text-slate-600">Accede a tu panel LegalTech con tu cuenta.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-900 focus:outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            ¿No tienes cuenta? <Link href="/registro" className="text-slate-900 font-semibold">Regístrate</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
