export function computeScrollProgress(scrollTop, scrollHeight, clientHeight) {
    const max = scrollHeight - clientHeight;
    if (max <= 0)
        return 0;
    return Math.min(100, Math.max(0, (scrollTop / max) * 100));
}
