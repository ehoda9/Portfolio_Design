import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getApiBaseUrl, submitContactMessage } from '../src/lib/contact-api';

describe('submitContactMessage', () => {
  const submission = { name: 'Mahmoud', email: 'mahmoud@example.com', message: 'Hello' };

  it('returns true and posts to /api/contact when the server responds ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitContactMessage('http://localhost:3000', submission);

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/contact',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      })
    );

    vi.unstubAllGlobals();
  });

  it('returns false when the server responds with an error status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    const result = await submitContactMessage('http://localhost:3000', submission);

    expect(result).toBe(false);
    vi.unstubAllGlobals();
  });

  it('returns false when the network request itself fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error'))
    );

    const result = await submitContactMessage('http://localhost:3000', submission);

    expect(result).toBe(false);
    vi.unstubAllGlobals();
  });
});

describe('getApiBaseUrl', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('reads the content attribute from the api-base-url meta tag', () => {
    document.head.innerHTML = '<meta name="api-base-url" content="https://api.example.com">';
    expect(getApiBaseUrl()).toBe('https://api.example.com');
  });

  it('returns an empty string when the meta tag is missing', () => {
    expect(getApiBaseUrl()).toBe('');
  });
});
