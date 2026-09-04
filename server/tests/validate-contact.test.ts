import { describe, it, expect } from 'vitest';
import { validateContactInput } from '../src/lib/validate-contact';

const valid = { name: 'Mahmoud', email: 'mahmoud@example.com', message: 'A project inquiry' };

describe('validateContactInput', () => {
  it('accepts a fully valid submission', () => {
    const result = validateContactInput(valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a missing name', () => {
    expect(validateContactInput({ ...valid, name: '' }).valid).toBe(false);
  });

  it('rejects a missing email', () => {
    expect(validateContactInput({ ...valid, email: '' }).valid).toBe(false);
  });

  it('rejects a malformed email', () => {
    expect(validateContactInput({ ...valid, email: 'not-an-email' }).valid).toBe(false);
  });

  it('rejects a missing message', () => {
    expect(validateContactInput({ ...valid, message: '' }).valid).toBe(false);
  });

  it('rejects a name over 200 characters', () => {
    expect(validateContactInput({ ...valid, name: 'a'.repeat(201) }).valid).toBe(false);
  });

  it('rejects a message over 5000 characters', () => {
    expect(validateContactInput({ ...valid, message: 'a'.repeat(5001) }).valid).toBe(false);
  });

  it('accepts a message right at the 5000 character limit', () => {
    expect(validateContactInput({ ...valid, message: 'a'.repeat(5000) }).valid).toBe(true);
  });

  it('collects multiple errors at once', () => {
    const result = validateContactInput({ name: '', email: '', message: '' });
    expect(result.errors.length).toBe(3);
  });

  it('trims whitespace-only fields and treats them as empty', () => {
    expect(validateContactInput({ name: '   ', email: valid.email, message: valid.message }).valid).toBe(false);
  });
});
