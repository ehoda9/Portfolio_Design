export async function submitContactMessage(apiBaseUrl, submission) {
    try {
        const res = await fetch(`${apiBaseUrl}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
export function getApiBaseUrl() {
    var _a, _b;
    return (_b = (_a = document.querySelector('meta[name="api-base-url"]')) === null || _a === void 0 ? void 0 : _a.getAttribute('content')) !== null && _b !== void 0 ? _b : '';
}
