export function isWebglSupported(canvas) {
    var _a;
    try {
        return Boolean((_a = canvas.getContext('webgl2')) !== null && _a !== void 0 ? _a : canvas.getContext('webgl'));
    }
    catch {
        return false;
    }
}
export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
