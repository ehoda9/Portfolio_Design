export const PALETTES = ['1', '2', '3'];
const STORAGE_KEY = 'portfolio-palette';
const DEFAULT_PALETTE = '1';
export function isValidPalette(value) {
    return value !== null && PALETTES.includes(value);
}
export function getStoredPalette() {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isValidPalette(stored) ? stored : DEFAULT_PALETTE;
}
export function applyPalette(paletteId) {
    if (!isValidPalette(paletteId))
        return;
    document.documentElement.setAttribute('data-palette', paletteId);
    window.localStorage.setItem(STORAGE_KEY, paletteId);
}
