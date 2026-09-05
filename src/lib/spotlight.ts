export interface PointerPercent {
  x: number;
  y: number;
}

/**
 * Converts a pointer's viewport coordinates into a percentage position
 * within `rect` (0–100 on each axis) — used to position the CSS radial
 * spotlight under the cursor on hover. Pure — takes a rect rather than
 * querying the DOM itself, so it's unit tested directly.
 */
export function computePointerPercent(rect: { left: number; top: number; width: number; height: number }, clientX: number, clientY: number): PointerPercent {
  const x = rect.width === 0 ? 50 : ((clientX - rect.left) / rect.width) * 100;
  const y = rect.height === 0 ? 50 : ((clientY - rect.top) / rect.height) * 100;
  return { x, y };
}
