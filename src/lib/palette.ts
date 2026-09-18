export const PALETTES = ['1', '2', '3'] as const;
export type PaletteId = (typeof PALETTES)[number];

const STORAGE_KEY = 'portfolio-palette';
const DEFAULT_PALETTE: PaletteId = '1';

/** True if the given value is one of the known palette ids. Pure. */
export function isValidPalette(value: string | null): value is PaletteId {
  return value !== null && (PALETTES as readonly string[]).includes(value);
}

/**
 * Reads the saved palette choice, falling back to the default if unset or
 * invalid. Uses `window.localStorage` explicitly (not the bare global) —
 * newer Node versions ship an experimental native `localStorage` that can
 * shadow jsdom's under Vitest, so the explicit reference is what actually
 * resolves to the working one in tests, not just in the browser.
 */
export function getStoredPalette(): PaletteId {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isValidPalette(stored) ? stored : DEFAULT_PALETTE;
}

/** Applies a palette to the document and persists the choice. No-op for an invalid id. */
export function applyPalette(paletteId: string): void {
  if (!isValidPalette(paletteId)) return;
  document.documentElement.setAttribute('data-palette', paletteId);
  window.localStorage.setItem(STORAGE_KEY, paletteId);
}
