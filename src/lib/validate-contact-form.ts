const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 500;

export interface ContactFormValues {
  name: string;
  email: string;
  desc: string;
}

/**
 * Validates the contact form fields. Pure — no DOM access — so it can be
 * unit tested directly without a browser or jsdom.
 */
export function validateContactForm(values: ContactFormValues): boolean {
  const name = values.name.trim();
  const email = values.email.trim();
  const desc = values.desc.trim();

  if (!name || !email || !desc) return false;
  if (name.length > MAX_FIELD_LENGTH || desc.length > MAX_FIELD_LENGTH) return false;

  return EMAIL_RE.test(email);
}
