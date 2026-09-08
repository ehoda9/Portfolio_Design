/**
 * Renders Markdown (as stored in the posts table) to sanitized HTML safe
 * to inject via innerHTML. Only the admin can write post content (see
 * server's admin auth), but it's sanitized anyway — defense in depth
 * costs nothing here and a compromised/mistaken admin session shouldn't
 * turn into stored XSS for every visitor.
 *
 * Both libraries are dynamically imported (loaded from a CDN via the
 * import map in blog-post.html) so their weight is never paid on pages
 * that don't render post content.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const { marked } = await import('marked');
  const DOMPurify = (await import('dompurify')).default;

  const rawHtml = await marked.parse(markdown);
  return DOMPurify.sanitize(rawHtml);
}
