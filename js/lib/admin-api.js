export async function adminLogin(apiBaseUrl, email, password) {
    var _a;
    try {
        const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok)
            return null;
        const data = (await res.json());
        return (_a = data.token) !== null && _a !== void 0 ? _a : null;
    }
    catch {
        return null;
    }
}
function authHeaders(token) {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}
async function adminGet(apiBaseUrl, path, token) {
    try {
        const res = await fetch(`${apiBaseUrl}${path}`, { headers: authHeaders(token) });
        if (!res.ok)
            return null;
        return (await res.json());
    }
    catch {
        return null;
    }
}
export async function fetchAdminPosts(apiBaseUrl, token) {
    var _a;
    const data = await adminGet(apiBaseUrl, '/api/admin/posts', token);
    return (_a = data === null || data === void 0 ? void 0 : data.posts) !== null && _a !== void 0 ? _a : null;
}
export async function fetchAdminPost(apiBaseUrl, token, id) {
    var _a;
    const data = await adminGet(apiBaseUrl, `/api/admin/posts/${id}`, token);
    return (_a = data === null || data === void 0 ? void 0 : data.post) !== null && _a !== void 0 ? _a : null;
}
export async function fetchContactMessages(apiBaseUrl, token) {
    var _a;
    const data = await adminGet(apiBaseUrl, '/api/admin/contact-messages', token);
    return (_a = data === null || data === void 0 ? void 0 : data.messages) !== null && _a !== void 0 ? _a : null;
}
export async function fetchAnalyticsSummary(apiBaseUrl, token) {
    return adminGet(apiBaseUrl, '/api/admin/analytics/summary', token);
}
export async function createPost(apiBaseUrl, token, values) {
    var _a;
    try {
        const res = await fetch(`${apiBaseUrl}/api/posts`, {
            method: 'POST',
            headers: authHeaders(token),
            body: JSON.stringify(values),
        });
        const body = res.ok ? undefined : (await res.json().catch(() => ({})));
        return { ok: res.ok, status: res.status, errors: (_a = body === null || body === void 0 ? void 0 : body.errors) !== null && _a !== void 0 ? _a : ((body === null || body === void 0 ? void 0 : body.error) ? [body.error] : undefined) };
    }
    catch {
        return { ok: false, status: 0, errors: ['Network error'] };
    }
}
export async function updatePost(apiBaseUrl, token, id, values) {
    var _a;
    try {
        const res = await fetch(`${apiBaseUrl}/api/posts/${id}`, {
            method: 'PUT',
            headers: authHeaders(token),
            body: JSON.stringify(values),
        });
        const body = res.ok ? undefined : (await res.json().catch(() => ({})));
        return { ok: res.ok, status: res.status, errors: (_a = body === null || body === void 0 ? void 0 : body.errors) !== null && _a !== void 0 ? _a : ((body === null || body === void 0 ? void 0 : body.error) ? [body.error] : undefined) };
    }
    catch {
        return { ok: false, status: 0, errors: ['Network error'] };
    }
}
export async function deletePost(apiBaseUrl, token, id) {
    try {
        const res = await fetch(`${apiBaseUrl}/api/posts/${id}`, {
            method: 'DELETE',
            headers: authHeaders(token),
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
