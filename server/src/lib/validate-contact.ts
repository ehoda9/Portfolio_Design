const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Server-side validation for the contact endpoint. Deliberately
 * independent of the frontend's validateContactForm — the frontend check
 * is only a UX nicety; a request can reach this endpoint directly (curl,
 * a script, a modified client), so the server has to enforce the real
 * rules itself regardless of what the client already checked.
 */
export function validateContactInput(input: Partial<ContactInput>): ValidationResult {
  const errors: string[] = [];

  const name = input.name?.trim() ?? '';
  const email = input.email?.trim() ?? '';
  const message = input.message?.trim() ?? '';

  if (!name) errors.push('name is required');
  else if (name.length > MAX_NAME_LENGTH) errors.push(`name must be ${MAX_NAME_LENGTH} characters or fewer`);

  if (!email) errors.push('email is required');
  else if (!EMAIL_RE.test(email)) errors.push('email must be a valid email address');

  if (!message) errors.push('message is required');
  else if (message.length > MAX_MESSAGE_LENGTH) errors.push(`message must be ${MAX_MESSAGE_LENGTH} characters or fewer`);

  return { valid: errors.length === 0, errors };
}
