const STORAGE_KEY = 'admin-session-token';
export function getSessionToken() {
    return window.sessionStorage.getItem(STORAGE_KEY);
}
export function setSessionToken(token) {
    window.sessionStorage.setItem(STORAGE_KEY, token);
}
export function clearSessionToken() {
    window.sessionStorage.removeItem(STORAGE_KEY);
}
