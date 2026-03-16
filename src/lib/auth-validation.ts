const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s()-]{7,20}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  if (!value.trim()) return true;
  return PHONE_REGEX.test(value.trim());
}

export function isStrongPassword(value: string): boolean {
  return PASSWORD_REGEX.test(value);
}

export function getPasswordHelpText(): string {
  return "Password must be at least 8 characters and include uppercase, lowercase, and a number.";
}
