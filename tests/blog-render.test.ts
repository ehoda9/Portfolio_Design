import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../src/lib/blog-render';

describe('renderMarkdown', () => {
  it('renders basic Markdown to HTML', async () => {
    const html = await renderMarkdown('# Hello\n\nThis is **bold** and *italic*.');
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('renders links', async () => {
    const html = await renderMarkdown('[a link](https://example.com)');
    expect(html).toContain('<a href="https://example.com">a link</a>');
  });

  it('renders code blocks', async () => {
    const html = await renderMarkdown('```\nconst x = 1;\n```');
    expect(html).toContain('<pre>');
    expect(html).toContain('const x = 1;');
  });

  it('strips raw <script> tags entirely', async () => {
    const html = await renderMarkdown('Hello <script>alert("xss")</script> world');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert(');
  });

  it('strips inline event handler attributes', async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain('onerror');
  });

  it('strips javascript: URLs from links', async () => {
    const html = await renderMarkdown('[click me](javascript:alert(1))');
    expect(html).not.toContain('javascript:');
  });

  it('preserves ordinary paragraph text unharmed', async () => {
    const html = await renderMarkdown('Just a normal sentence.');
    expect(html).toContain('Just a normal sentence.');
  });
});
