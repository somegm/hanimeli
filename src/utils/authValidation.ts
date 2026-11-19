export const AUTH_LIMITS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_DISPLAY_NAME_LENGTH: 2,
  MAX_DISPLAY_NAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 254,
} as const;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_UPPERCASE_PATTERN = /[A-Z]/;
const PASSWORD_PUNCTUATION_PATTERN = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return 'E-posta adresi zorunludur.';
  }

  if (trimmed.length > AUTH_LIMITS.MAX_EMAIL_LENGTH) {
    return `E-posta en fazla ${AUTH_LIMITS.MAX_EMAIL_LENGTH} karakter olabilir.`;
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return 'Geçerli bir e-posta adresi girin.';
  }

  return null;
}

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Ad soyad alanı zorunludur.';
  }

  if (trimmed.length < AUTH_LIMITS.MIN_DISPLAY_NAME_LENGTH) {
    return `Ad soyad en az ${AUTH_LIMITS.MIN_DISPLAY_NAME_LENGTH} karakter olmalıdır.`;
  }

  if (trimmed.length > AUTH_LIMITS.MAX_DISPLAY_NAME_LENGTH) {
    return `Ad soyad en fazla ${AUTH_LIMITS.MAX_DISPLAY_NAME_LENGTH} karakter olabilir.`;
  }

  return null;
}

export function validateSignupPassword(password: string): string | null {
  if (!password) {
    return 'Şifre zorunludur.';
  }

  if (password.length < AUTH_LIMITS.MIN_PASSWORD_LENGTH) {
    return `Şifre en az ${AUTH_LIMITS.MIN_PASSWORD_LENGTH} karakter olmalıdır.`;
  }

  if (password.length > AUTH_LIMITS.MAX_PASSWORD_LENGTH) {
    return `Şifre en fazla ${AUTH_LIMITS.MAX_PASSWORD_LENGTH} karakter olabilir.`;
  }

  if (!PASSWORD_UPPERCASE_PATTERN.test(password)) {
    return 'Şifre en az bir büyük harf içermelidir.';
  }

  if (!PASSWORD_PUNCTUATION_PATTERN.test(password)) {
    return 'Şifre en az bir noktalama işareti içermelidir.';
  }

  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (!password.trim()) {
    return 'Şifre zorunludur.';
  }

  return null;
}
