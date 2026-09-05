import { isWebglSupported, prefersReducedMotion } from './webgl-support.js';

export type HeroSceneCleanup = () => void;

/**
 * Blends a rotation value toward a pointer-driven target. `smoothing` is
 * 0–1 (higher = snappier). Pure — extracted so the easing math itself
 * can be unit tested, since the render loop that calls it every frame
 * can't run without a real WebGL context.
 */
export function dampRotation(current: number, target: number, smoothing: number): number {
  return current + (target - current) * smoothing;
}

/** Reads a CSS custom property from :root, falling back if it's unset (e.g. before styles.css loads). */
export function readCssColor(varName: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value || fallback;
}

/**
 * Sets up a subtle rotating wireframe in the hero section — a
 * blueprint-style geometric form that drifts gently and responds to
 * pointer position. Returns a cleanup function, or null if the scene
 * never started (no WebGL, or the user prefers reduced motion) — in
 * either case the existing CSS grid/gradient background is left as the
 * only visual, nothing else needs to change.
 *
 * three.js is dynamically imported, not statically — its ~600KB is
 * never fetched at all for users who won't see the scene anyway.
 *
 * Everything below this point touches a real WebGL context, which
 * jsdom (used in tests) never implements — there is no way to exercise
 * it in this test suite. tests/hero-scene.test.ts covers the two pure
 * helpers above instead, and confirms this function correctly returns
 * null when WebGL/motion preferences say it should.
 */
/* v8 ignore start */
export async function initHeroScene(canvas: HTMLCanvasElement): Promise<HeroSceneCleanup | null> {
  if (prefersReducedMotion()) return null;
  if (!isWebglSupported(canvas)) return null;

  const THREE = await import('three');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const group = new THREE.Group();

  const geometry = new THREE.IcosahedronGeometry(2, 1);
  const wireframe = new THREE.WireframeGeometry(geometry);
  const line = new THREE.LineSegments(
    wireframe,
    new THREE.LineBasicMaterial({ color: readCssColor('--gold', '#d9b36c'), transparent: true, opacity: 0.55 })
  );
  group.add(line);

  // A handful of small "node" points at vertices — a nod to the data/AI
  // side of the brand, not just the game-dev wireframe.
  const positions = geometry.attributes.position;
  const nodePositions: number[] = [];
  for (let i = 0; i < positions.count; i += 4) {
    nodePositions.push(positions.getX(i), positions.getY(i), positions.getZ(i));
  }
  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
  const nodes = new THREE.Points(nodeGeometry, new THREE.PointsMaterial({ color: readCssColor('--cyan', '#5b9ee8'), size: 0.06 }));
  group.add(nodes);

  scene.add(group);

  let pointerX = 0;
  let pointerY = 0;
  function onPointerMove(e: PointerEvent): void {
    const rect = canvas.getBoundingClientRect();
    pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  }
  window.addEventListener('pointermove', onPointerMove);

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  // Skip rendering work when the hero has scrolled off-screen or the tab
  // is backgrounded — this scene never needs to burn CPU/GPU or battery
  // when nobody can see it.
  let isVisible = true;
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0 }
  );
  intersectionObserver.observe(canvas);

  let running = true;
  let frameId = requestAnimationFrame(tick);

  function onVisibilityChange(): void {
    running = document.visibilityState === 'visible';
    if (running) frameId = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  function tick(): void {
    if (!running) return;
    if (isVisible) {
      group.rotation.y += 0.0022;
      group.rotation.x += 0.0008;
      group.rotation.y = dampRotation(group.rotation.y, pointerX * 0.3, 0.02);
      group.rotation.x = dampRotation(group.rotation.x, pointerY * -0.2, 0.02);
      renderer.render(scene, camera);
    }
    frameId = requestAnimationFrame(tick);
  }

  return function cleanup(): void {
    running = false;
    cancelAnimationFrame(frameId);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    geometry.dispose();
    wireframe.dispose();
    nodeGeometry.dispose();
    line.material.dispose();
    nodes.material.dispose();
    renderer.dispose();
  };
}
/* v8 ignore stop */
