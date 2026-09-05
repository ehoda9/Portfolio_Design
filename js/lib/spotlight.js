export function computePointerPercent(rect, clientX, clientY) {
    const x = rect.width === 0 ? 50 : ((clientX - rect.left) / rect.width) * 100;
    const y = rect.height === 0 ? 50 : ((clientY - rect.top) / rect.height) * 100;
    return { x, y };
}
