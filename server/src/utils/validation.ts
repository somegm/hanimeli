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

export function sanitizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const email = raw.trim().toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email) || email.length > AUTH_LIMITS.MAX_EMAIL_LENGTH) {
    return null;
  }
  return email;
}

export function sanitizeDisplayName(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const name = raw.trim();
  if (
    !name ||
    name.length < AUTH_LIMITS.MIN_DISPLAY_NAME_LENGTH ||
    name.length > AUTH_LIMITS.MAX_DISPLAY_NAME_LENGTH
  ) {
    return null;
  }
  return name;
}

export function sanitizeLoginPassword(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const password = raw.trim();
  if (!password || password.length > AUTH_LIMITS.MAX_PASSWORD_LENGTH) {
    return null;
  }
  return password;
}

export function validateSignupPassword(password: string): string | null {
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
