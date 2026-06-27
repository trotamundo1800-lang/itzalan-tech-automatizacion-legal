import { describe, expect, it } from 'vitest';
import { validateEmail, validatePassword, validateRegisterForm } from './auth-validation';

describe('web auth validation', () => {
  it('validates email format', () => {
    expect(validateEmail('no-email')).toBe('Ingresa un correo válido');
    expect(validateEmail('legal@itzalan.com')).toBeNull();
  });

  it('validates password minimum length', () => {
    expect(validatePassword('123')).toBe('La contraseña debe tener al menos 8 caracteres');
    expect(validatePassword('12345678')).toBeNull();
  });

  it('validates register form role and name', () => {
    expect(
      validateRegisterForm({
        name: 'A',
        email: 'legal@itzalan.com',
        password: '12345678',
        role: 'cliente',
      }),
    ).toBe('El nombre debe tener al menos 2 caracteres');

    expect(
      validateRegisterForm({
        name: 'Ana',
        email: 'legal@itzalan.com',
        password: '12345678',
        role: 'admin',
      }),
    ).toBeNull();
  });
});
