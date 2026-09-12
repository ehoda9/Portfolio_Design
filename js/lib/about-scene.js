import { isWebglSupported, prefersReducedMotion } from './webgl-support.js';
import { dampRotation, readCssColor } from './hero-scene.js';
export async function initAboutScene(canvas, imageUrl) {
    if (prefersReducedMotion())
        return null;
    if (!isWebglSupported(canvas))
        return null;
    const THREE = await import('three');
    let texture;
    try {
        texture = await new THREE.TextureLoader().loadAsync(imageUrl);
    }
    catch {
        return null;
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.z = 4.2;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const image = texture.image;
    const aspect = (image.width || 1) / (image.height || 1);
    const planeHeight = 2.4;
    const planeWidth = planeHeight * aspect;
    const photoGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const photoMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
    scene.add(photoMesh);
    const gold = readCssColor('--gold', '#d9b36c');
    const cyan = readCssColor('--cyan', '#5b9ee8');
    const ringRadius = Math.max(planeWidth, planeHeight) * 0.68;
    const ringGeometry = new THREE.RingGeometry(ringRadius, ringRadius * 1.02, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = -0.4;
    scene.add(ring);
    const particleCount = 36;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = ringRadius * (1.05 + Math.random() * 0.2);
        particlePositions[i * 3] = Math.cos(angle) * radius;
        particlePositions[i * 3 + 1] = Math.sin(angle) * radius * 0.7;
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5 - 0.2;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: cyan, size: 0.035, transparent: true, opacity: 0.85 });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    let pointerX = 0;
    let pointerY = 0;
    let pointerActive = false;
    function onPointerMove(e) {
        const rect = canvas.getBoundingClientRect();
        pointerX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointerY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        pointerActive = true;
    }
    function onPointerLeave() {
        pointerActive = false;
    }
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
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
            const targetY = pointerActive ? pointerX * 0.4 : Math.sin(elapsed * 0.3) * 0.12;
            const targetX = pointerActive ? -pointerY * 0.3 : Math.cos(elapsed * 0.25) * 0.06;
            photoMesh.rotation.y = dampRotation(photoMesh.rotation.y, targetY, 0.05);
            photoMesh.rotation.x = dampRotation(photoMesh.rotation.x, targetX, 0.05);
            photoMesh.position.y = Math.sin(elapsed * 0.7) * 0.06;
            ring.rotation.z += 0.0025;
            ring.position.y = photoMesh.position.y;
            particles.rotation.z -= 0.0018;
            particles.position.y = photoMesh.position.y;
            renderer.render(scene, camera);
        }
        frameId = requestAnimationFrame(tick);
    }
    return function cleanup() {
        running = false;
        cancelAnimationFrame(frameId);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        photoGeometry.dispose();
        photoMaterial.dispose();
        texture.dispose();
        ringGeometry.dispose();
        ringMaterial.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        renderer.dispose();
    };
}
