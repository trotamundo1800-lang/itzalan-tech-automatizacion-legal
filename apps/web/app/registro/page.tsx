'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, HeroPanel, PageShell } from '../../components/ui';

export default function RegistroPage() {
  const [done, setDone] = useState(false);

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
          onSubmit={(event) => {
            event.preventDefault();
            setDone(true);
          }}
        >
          <label className="lex-label">
            Nombre
            <input className="lex-input" required />
          </label>

          <label className="lex-label">
            Correo
            <input type="email" className="lex-input" required />
          </label>

          <label className="lex-label">
            Teléfono
            <input className="lex-input" required />
          </label>

          <label className="lex-label">
            Contraseña
            <input type="password" className="lex-input" required />
          </label>

          <label className="lex-label">
            Tipo de usuario
            <select className="lex-input" required>
              <option value="abogado">Abogado</option>
              <option value="asistente">Asistente</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>

          <button type="submit" className="lex-button-primary w-full">
            Crear cuenta
          </button>

          {done ? <p className="lex-notice-success">Registro demo completado.</p> : null}
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