'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, HeroPanel, PageShell } from '../../components/ui';

export default function LoginPage() {
  const [sent, setSent] = useState(false);

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
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <label className="lex-label">
            Correo
            <input type="email" className="lex-input" required />
          </label>

          <label className="lex-label">
            Contraseña
            <input type="password" className="lex-input" required />
          </label>

          <button type="submit" className="lex-button-primary w-full">
            Iniciar sesión
          </button>

          {sent ? <p className="lex-notice-success">Acceso demo validado.</p> : null}
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
