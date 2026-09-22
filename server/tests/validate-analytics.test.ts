import { describe, it, expect } from 'vitest';
import { isValidPagePath } from '../src/lib/validate-analytics';

describe('isValidPagePath', () => {
  it('accepts a normal path', () => {
    expect(isValidPagePath('/blog-post.html')).toBe(true);
  });

  it('accepts the root path', () => {
    expect(isValidPagePath('/')).toBe(true);
  });

  it('accepts a path with a query string', () => {
    expect(isValidPagePath('/blog-post.html?slug=hello-world')).toBe(true);
  });

  it('rejects a non-string value', () => {
    expect(isValidPagePath(123)).toBe(false);
    expect(isValidPagePath(null)).toBe(false);
    expect(isValidPagePath(undefined)).toBe(false);
    expect(isValidPagePath({})).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidPagePath('')).toBe(false);
  });

  it('rejects a path not starting with /', () => {
    expect(isValidPagePath('blog-post.html')).toBe(false);
    expect(isValidPagePath('https://evil.example.com')).toBe(false);
  });

  it('rejects an overly long path', () => {
    expect(isValidPagePath('/' + 'a'.repeat(200))).toBe(false);
  });

  it('accepts a path right at the length limit', () => {
    expect(isValidPagePath('/' + 'a'.repeat(199))).toBe(true);
  });
});
