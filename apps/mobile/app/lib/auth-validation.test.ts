import { describe, expect, it } from 'vitest';
import {
  validateMobileEmail,
  validateMobilePassword,
  validateMobileRegisterForm,
} from './auth-validation';

describe('mobile auth validation', () => {
  it('rejects invalid email', () => {
    expect(validateMobileEmail('bad-email')).toBe('Ingresa un correo válido');
    expect(validateMobileEmail('user@itzalan.com')).toBeNull();
  });

  it('rejects short password', () => {
    expect(validateMobilePassword('12345')).toBe('La contraseña debe tener al menos 8 caracteres');
    expect(validateMobilePassword('12345678')).toBeNull();
  });

  it('rejects invalid role in register form', () => {
    expect(
      validateMobileRegisterForm({
        name: 'Ana',
        email: 'ana@itzalan.com',
        password: '12345678',
        role: 'superadmin',
      }),
    ).toBe('Selecciona un rol válido');
  });
});
