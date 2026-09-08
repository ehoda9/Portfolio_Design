export async function fetchPublishedPosts(apiBaseUrl) {
    try {
        const res = await fetch(`${apiBaseUrl}/api/posts`);
        if (!res.ok)
            return null;
        const data = (await res.json());
        return Array.isArray(data.posts) ? data.posts : null;
    }
    catch {
        return null;
    }
}
export async function fetchPostBySlug(apiBaseUrl, slug) {
    var _a;
    try {
        const res = await fetch(`${apiBaseUrl}/api/posts/${encodeURIComponent(slug)}`);
        if (!res.ok)
            return null;
        const data = (await res.json());
        return (_a = data.post) !== null && _a !== void 0 ? _a : null;
    }
    catch {
        return null;
    }
}
