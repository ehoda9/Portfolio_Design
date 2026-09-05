import { isWebglSupported, prefersReducedMotion } from './webgl-support.js';
export function dampRotation(current, target, smoothing) {
    return current + (target - current) * smoothing;
}
export function readCssColor(varName, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || fallback;
}
export async function initHeroScene(canvas) {
    if (prefersReducedMotion())
        return null;
    if (!isWebglSupported(canvas))
        return null;
    const THREE = await import('three');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 6;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const group = new THREE.Group();
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: readCssColor('--gold', '#d9b36c'), transparent: true, opacity: 0.55 }));
    group.add(line);
    const positions = geometry.attributes.position;
    const nodePositions = [];
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
    function onPointerMove(e) {
        const rect = canvas.getBoundingClientRect();
        pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    window.addEventListener('pointermove', onPointerMove);
    function resize() {
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
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver((entries) => {
        var _a, _b;
        isVisible = (_b = (_a = entries[0]) === null || _a === void 0 ? void 0 : _a.isIntersecting) !== null && _b !== void 0 ? _b : true;
    }, { threshold: 0 });
    intersectionObserver.observe(canvas);
    let running = true;
    let frameId = requestAnimationFrame(tick);
    function onVisibilityChange() {
        running = document.visibilityState === 'visible';
        if (running)
            frameId = requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    function tick() {
        if (!running)
            return;
        if (isVisible) {
            group.rotation.y += 0.0022;
            group.rotation.x += 0.0008;
            group.rotation.y = dampRotation(group.rotation.y, pointerX * 0.3, 0.02);
            group.rotation.x = dampRotation(group.rotation.x, pointerY * -0.2, 0.02);
            renderer.render(scene, camera);
        }
        frameId = requestAnimationFrame(tick);
    }
    return function cleanup() {
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
