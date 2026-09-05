/**
 * Checks whether the browser can actually get a WebGL context from the
 * given canvas. False in any environment without real WebGL — including
 * jsdom (used in tests), which never implements it — so this doubles as
 * the natural test for "does the fallback path trigger correctly."
 */
export function isWebglSupported(canvas: HTMLCanvasElement): boolean {
  try {
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** True if the user has asked the OS/browser to minimize motion. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
