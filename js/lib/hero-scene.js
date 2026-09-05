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
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    const baseCameraPos = new THREE.Vector3(0, 0, 7.5);
    camera.position.copy(baseCameraPos);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const gold = readCssColor('--gold', '#d9b36c');
    const cyan = readCssColor('--cyan', '#5b9ee8');
    const outerGeometry = new THREE.IcosahedronGeometry(3.1, 1);
    const outerWireframe = new THREE.WireframeGeometry(outerGeometry);
    const outerLine = new THREE.LineSegments(outerWireframe, new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.85 }));
    const innerGeometry = new THREE.IcosahedronGeometry(1.7, 1);
    const innerWireframe = new THREE.WireframeGeometry(innerGeometry);
    const innerLine = new THREE.LineSegments(innerWireframe, new THREE.LineBasicMaterial({ color: cyan, transparent: true, opacity: 0.7 }));
    const positions = outerGeometry.attributes.position;
    const nodePositions = [];
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
    let elapsed = 0;
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
            elapsed += 0.016;
            outerLine.rotation.y += 0.0035;
            outerLine.rotation.x += 0.0012;
            nodes.rotation.y = outerLine.rotation.y;
            nodes.rotation.x = outerLine.rotation.x;
            innerLine.rotation.y -= 0.006;
            innerLine.rotation.x -= 0.002;
            const breathe = 1 + Math.sin(elapsed * 0.6) * 0.03;
            outerLine.scale.setScalar(breathe);
            camera.position.x = dampRotation(camera.position.x, baseCameraPos.x + pointerX * 1.4, 0.03);
            camera.position.y = dampRotation(camera.position.y, baseCameraPos.y - pointerY * 1.0, 0.03);
            camera.lookAt(0, 0, 0);
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
