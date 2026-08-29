import { describe, it, expect } from 'vitest';
import { validateContactForm } from '../src/lib/validate-contact-form';

describe('validateContactForm', () => {
  it('accepts a fully filled, valid submission', () => {
    expect(validateContactForm({ name: 'Mahmoud', email: 'mahmoud@example.com', desc: 'A UE5 project' })).toBe(true);
  });

  it('rejects a missing name', () => {
    expect(validateContactForm({ name: '', email: 'a@b.com', desc: 'details' })).toBe(false);
  });

  it('rejects a missing email', () => {
    expect(validateContactForm({ name: 'Mahmoud', email: '', desc: 'details' })).toBe(false);
  });

  it('rejects a missing project description', () => {
    expect(validateContactForm({ name: 'Mahmoud', email: 'a@b.com', desc: '' })).toBe(false);
  });

  it('rejects a malformed email address', () => {
    expect(validateContactForm({ name: 'Mahmoud', email: 'not-an-email', desc: 'details' })).toBe(false);
  });

  it('trims whitespace-only fields and treats them as empty', () => {
    expect(validateContactForm({ name: '   ', email: 'a@b.com', desc: 'details' })).toBe(false);
  });

  it('accepts emails with subdomains and plus-addressing', () => {
    expect(validateContactForm({ name: 'Mahmoud', email: 'mahmoud+work@mail.example.co', desc: 'details' })).toBe(true);
  });
});
