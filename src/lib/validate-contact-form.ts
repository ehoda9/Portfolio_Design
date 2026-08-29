const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  return EMAIL_RE.test(email);
}
