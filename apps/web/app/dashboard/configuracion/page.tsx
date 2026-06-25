'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '../../../components/ui';
import { getProfile, updateProfile } from '../../../lib/demoData';

export default function DashboardConfiguracionPage() {
  const [current, setCurrent] = useState<Awaited<ReturnType<typeof getProfile>> | null>(null);
  const [form, setForm] = useState({
    despacho: '',
    nombre: '',
    correo: '',
    telefono: '',
    password: '',
    notificaciones: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void (async () => {
      const profile = await getProfile();
      setCurrent(profile);
      setForm({
        despacho: profile.despacho,
        nombre: profile.nombre,
        correo: profile.correo,
        telefono: profile.telefono,
        password: '',
        notificaciones: true,
      });
    })();
  }, []);

  if (!current) {
    return <Card title="Configuración" subtitle="Datos del despacho, perfil y notificaciones">Cargando configuración...</Card>;
  }

  return (
    <Card title="Configuración" subtitle="Datos del despacho, perfil y notificaciones">
      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await updateProfile({
            despacho: form.despacho,
            nombre: form.nombre,
            correo: form.correo,
            telefono: form.telefono,
          });
          setSaved(true);
        }}
      >
        <label className="lex-label">
          Datos del despacho
          <input className="lex-input" value={form.despacho} onChange={(e) => setForm((s) => ({ ...s, despacho: e.target.value }))} required />
        </label>
        <label className="lex-label">
          Nombre del usuario
          <input className="lex-input" value={form.nombre} onChange={(e) => setForm((s) => ({ ...s, nombre: e.target.value }))} required />
        </label>
        <label className="lex-label">
          Correo
          <input type="email" className="lex-input" value={form.correo} onChange={(e) => setForm((s) => ({ ...s, correo: e.target.value }))} required />
        </label>
        <label className="lex-label">
          Contraseña
          <input type="password" className="lex-input" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} placeholder="Nueva contraseña" />
        </label>
        <label className="lex-label">
          Preferencias de notificación
          <select
            className="lex-input"
            value={form.notificaciones ? 'si' : 'no'}
            onChange={(e) => setForm((s) => ({ ...s, notificaciones: e.target.value === 'si' }))}
          >
            <option value="si">Activadas</option>
            <option value="no">Desactivadas</option>
          </select>
        </label>
        <Button type="submit">Guardar configuración</Button>
        {saved ? <p className="lex-notice-success">Configuración actualizada correctamente.</p> : null}
      </form>
    </Card>
  );
}
