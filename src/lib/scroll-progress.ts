/**
 * Percentage (0–100) of how far the page has been scrolled. Pure — takes
 * the three numbers it needs rather than reading `window`/`document`
 * itself, so it's unit tested directly.
 */
export function computeScrollProgress(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const max = scrollHeight - clientHeight;
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (scrollTop / max) * 100));
}
