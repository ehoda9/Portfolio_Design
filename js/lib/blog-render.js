export async function renderMarkdown(markdown) {
    const { marked } = await import('marked');
    const DOMPurify = (await import('dompurify')).default;
    const rawHtml = await marked.parse(markdown);
    return DOMPurify.sanitize(rawHtml);
}
