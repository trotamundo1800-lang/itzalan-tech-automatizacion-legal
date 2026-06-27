export function validateEmail(email: string): string | null {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) return 'El correo es obligatorio';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) return 'Ingresa un correo válido';

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'La contraseña es obligatoria';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  return null;
}

export function validateRegisterForm(input: {
  name: string;
  email: string;
  password: string;
  role: string;
}): string | null {
  const normalizedName = input.name.trim();
  if (normalizedName.length < 2) return 'El nombre debe tener al menos 2 caracteres';

  const emailError = validateEmail(input.email);
  if (emailError) return emailError;

  const passwordError = validatePassword(input.password);
  if (passwordError) return passwordError;

  if (!['cliente', 'admin', 'abogado', 'asistente'].includes(input.role)) {
    return 'Selecciona un rol válido';
  }

  return null;
}
