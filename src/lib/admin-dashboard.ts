export type EditorMode = { mode: 'new' } | { mode: 'edit'; id: number } | null;

/**
 * Parses admin.html's query string to decide which view to show —
 * `?post=new` for the create form, `?post=<id>` for editing, or nothing
 * for the dashboard. Pure — takes the search string rather than reading
 * `window.location` itself, so it's unit tested directly.
 */
export function parseEditorMode(search: string): EditorMode {
  const params = new URLSearchParams(search);
  const post = params.get('post');

  if (post === null) return null;
  if (post === 'new') return { mode: 'new' };

  const id = Number(post);
  return Number.isInteger(id) && id > 0 ? { mode: 'edit', id } : null;
}

/** e.g. "3 published, 2 draft" */
export function formatPostBreakdown(published: number, draft: number): string {
  return `${published} published, ${draft} draft`;
}
