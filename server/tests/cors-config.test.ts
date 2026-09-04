import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAllowedOrigins } from '../src/lib/cors-config';

describe('getAllowedOrigins', () => {
  const original = process.env.CORS_ORIGIN;

  beforeEach(() => {
    delete process.env.CORS_ORIGIN;
  });

  afterEach(() => {
    if (original === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = original;
  });

  it('defaults to the docker-compose frontend origin when unset', () => {
    expect(getAllowedOrigins()).toEqual(['http://localhost:8080']);
  });

  it('parses a single configured origin', () => {
    process.env.CORS_ORIGIN = 'https://mahmoud.dev';
    expect(getAllowedOrigins()).toEqual(['https://mahmoud.dev']);
  });

  it('parses multiple comma-separated origins and trims whitespace', () => {
    process.env.CORS_ORIGIN = 'https://mahmoud.dev, https://www.mahmoud.dev ,http://localhost:8080';
    expect(getAllowedOrigins()).toEqual(['https://mahmoud.dev', 'https://www.mahmoud.dev', 'http://localhost:8080']);
  });

  it('drops empty entries from stray commas', () => {
    process.env.CORS_ORIGIN = 'https://mahmoud.dev,,';
    expect(getAllowedOrigins()).toEqual(['https://mahmoud.dev']);
  });
});
