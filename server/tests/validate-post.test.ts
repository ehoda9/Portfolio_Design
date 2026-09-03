import { describe, it, expect } from 'vitest';
import { validatePostInput } from '../src/lib/validate-post';

const validInput = {
  slug: 'my-first-post',
  title: 'My First Post',
  excerpt: 'A short summary',
  content: 'The full body of the post',
  status: 'draft',
};

describe('validatePostInput', () => {
  it('accepts a fully valid post', () => {
    const result = validatePostInput(validInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects a missing slug', () => {
    const result = validatePostInput({ ...validInput, slug: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('slug is required');
  });

  it('rejects a slug with uppercase letters', () => {
    const result = validatePostInput({ ...validInput, slug: 'My-Post' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('slug'))).toBe(true);
  });

  it('rejects a slug with spaces or special characters', () => {
    const result = validatePostInput({ ...validInput, slug: 'my post!' });
    expect(result.valid).toBe(false);
  });

  it('rejects a slug with leading/trailing hyphens', () => {
    const result = validatePostInput({ ...validInput, slug: '-my-post-' });
    expect(result.valid).toBe(false);
  });

  it('accepts a slug with numbers and multiple hyphens', () => {
    const result = validatePostInput({ ...validInput, slug: 'post-2024-v2' });
    expect(result.valid).toBe(true);
  });

  it('rejects a title over 200 characters', () => {
    const result = validatePostInput({ ...validInput, title: 'a'.repeat(201) });
    expect(result.valid).toBe(false);
  });

  it('rejects an excerpt over 500 characters', () => {
    const result = validatePostInput({ ...validInput, excerpt: 'a'.repeat(501) });
    expect(result.valid).toBe(false);
  });

  it('rejects content over 50,000 characters', () => {
    const result = validatePostInput({ ...validInput, content: 'a'.repeat(50_001) });
    expect(result.valid).toBe(false);
  });

  it('accepts content right at the 50,000 character limit', () => {
    const result = validatePostInput({ ...validInput, content: 'a'.repeat(50_000) });
    expect(result.valid).toBe(true);
  });

  it('rejects an invalid status value', () => {
    const result = validatePostInput({ ...validInput, status: 'archived' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('status'))).toBe(true);
  });

  it('accepts status "published"', () => {
    const result = validatePostInput({ ...validInput, status: 'published' });
    expect(result.valid).toBe(true);
  });

  it('collects multiple errors at once', () => {
    const result = validatePostInput({ slug: '', title: '', excerpt: '', content: '', status: '' });
    expect(result.errors.length).toBe(5);
  });
});
