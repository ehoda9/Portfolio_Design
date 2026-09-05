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
 * Sets up a rotating blueprint-style 3D scene spanning the hero section —
 * two concentric wireframe shells (gold outer, cyan inner) counter-rotating
 * at different speeds, a scattering of node points, and a camera that
 * drifts toward the pointer for a real sense of depth/parallax, not just
 * an object spinning in place. Returns a cleanup function, or null if the
 * scene never started (no WebGL, or the user prefers reduced motion) — in
 * either case the existing CSS grid/gradient background is left as the
 * only visual, nothing else needs to change.
 *
 * three.js is dynamically imported, not statically — its ~600KB is never
 * fetched at all for users who won't see the scene anyway.
 *
 * Everything below this point touches a real WebGL context, which jsdom
 * (used in tests) never implements — there is no way to exercise it in
 * this test suite. tests/hero-scene.test.ts covers the two pure helpers
 * above instead, and confirms this function correctly returns null when
 * WebGL/motion preferences say it should.
 */
/* v8 ignore start */
export async function initHeroScene(canvas: HTMLCanvasElement): Promise<HeroSceneCleanup | null> {
  if (prefersReducedMotion()) return null;
  if (!isWebglSupported(canvas)) return null;

  const THREE = await import('three');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  const baseCameraPos = new THREE.Vector3(0, 0, 7.5);
  camera.position.copy(baseCameraPos);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const gold = readCssColor('--gold', '#d9b36c');
  const cyan = readCssColor('--cyan', '#5b9ee8');

  // Outer shell — larger, slower, gold.
  const outerGeometry = new THREE.IcosahedronGeometry(3.1, 1);
  const outerWireframe = new THREE.WireframeGeometry(outerGeometry);
  const outerLine = new THREE.LineSegments(
    outerWireframe,
    new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.85 })
  );

  // Inner shell — smaller, faster, cyan, counter-rotating.
  const innerGeometry = new THREE.IcosahedronGeometry(1.7, 1);
  const innerWireframe = new THREE.WireframeGeometry(innerGeometry);
  const innerLine = new THREE.LineSegments(
    innerWireframe,
    new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.7 })
  );

  // Node points scattered on the outer shell — a nod to the data/AI side
  // of the brand, not just the game-dev wireframe.
  const positions = outerGeometry.attributes.position;
  const nodePositions: number[] = [];
  for (let i = 0; i < positions.count; i += 3) {
    nodePositions.push(positions.getX(i), positions.getY(i), positions.getZ(i));
  }
  const nodeGeometry = new THREE.BufferGeometry();
  nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
  const nodes = new THREE.Points(nodeGeometry, new THREE.PointsMaterial({ color: gold, size: 0.09, transparent: true, opacity: 0.9 }));

  const group = new THREE.Group();
  group.add(outerLine, innerLine, nodes);
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
  let elapsed = 0;

  function onVisibilityChange(): void {
    running = document.visibilityState === 'visible';
    if (running) frameId = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  function tick(): void {
    if (!running) return;
    if (isVisible) {
      elapsed += 0.016;

      outerLine.rotation.y += 0.0035;
      outerLine.rotation.x += 0.0012;
      nodes.rotation.y = outerLine.rotation.y;
      nodes.rotation.x = outerLine.rotation.x;

      innerLine.rotation.y -= 0.006;
      innerLine.rotation.x -= 0.002;

      // Gentle breathing scale on the outer shell.
      const breathe = 1 + Math.sin(elapsed * 0.6) * 0.03;
      outerLine.scale.setScalar(breathe);

      // Camera drifts toward the pointer — real parallax depth, not just
      // the object spinning in place.
      camera.position.x = dampRotation(camera.position.x, baseCameraPos.x + pointerX * 1.4, 0.03);
      camera.position.y = dampRotation(camera.position.y, baseCameraPos.y - pointerY * 1.0, 0.03);
      camera.lookAt(0, 0, 0);

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
    outerGeometry.dispose();
    outerWireframe.dispose();
    innerGeometry.dispose();
    innerWireframe.dispose();
    nodeGeometry.dispose();
    outerLine.material.dispose();
    innerLine.material.dispose();
    nodes.material.dispose();
    renderer.dispose();
  };
}
/* v8 ignore stop */
