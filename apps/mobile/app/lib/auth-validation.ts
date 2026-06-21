export function validateMobileEmail(email: string): string | null {
  const normalized = email.trim();
  if (!normalized) return 'El correo es obligatorio';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(normalized) ? null : 'Ingresa un correo válido';
}

export function validateMobilePassword(password: string): string | null {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  return null;
}

export function validateMobileRegisterForm(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): string | null {
  if (input.name.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';

  const emailError = validateMobileEmail(input.email);
  if (emailError) return emailError;

  const passwordError = validateMobilePassword(input.password);
  if (passwordError) return passwordError;

  if (!['cliente', 'abogado', 'asistente'].includes(input.role)) {
    return 'Selecciona un rol válido';
  }

  return null;
}
