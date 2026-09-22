export function parseEditorMode(search) {
    const params = new URLSearchParams(search);
    const post = params.get('post');
    if (post === null)
        return null;
    if (post === 'new')
        return { mode: 'new' };
    const id = Number(post);
    return Number.isInteger(id) && id > 0 ? { mode: 'edit', id } : null;
}
export function formatPostBreakdown(published, draft) {
    return `${published} published, ${draft} draft`;
}
