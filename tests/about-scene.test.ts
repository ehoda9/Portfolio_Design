import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initAboutScene } from '../src/lib/about-scene';

describe('initAboutScene', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when the user prefers reduced motion', async () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    const canvas = document.createElement('canvas');

    expect(await initAboutScene(canvas, '/assets/img/mahmoud-mohamed.jpg')).toBeNull();
  });

  it('returns null when WebGL is unavailable (always true in jsdom)', async () => {
    const canvas = document.createElement('canvas');
    expect(await initAboutScene(canvas, '/assets/img/mahmoud-mohamed.jpg')).toBeNull();
  });
});
