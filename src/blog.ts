import { initSiteChrome } from './lib/site-chrome.js';
import { fetchPublishedPosts } from './lib/blog-api.js';
import { formatPublishedDate } from './lib/format-date.js';
import { getApiBaseUrl } from './lib/contact-api.js';

initSiteChrome();

const loadingEl = document.getElementById('blog-list-loading') as HTMLElement;
const emptyEl = document.getElementById('blog-list-empty') as HTMLElement;
const errorEl = document.getElementById('blog-list-error') as HTMLElement;
const listEl = document.getElementById('blog-list') as HTMLElement;

function renderPostCard(post: { slug: string; title: string; excerpt: string; publishedAt: string }): string {
  return `
    <a class="blog-list__item" href="blog-post.html?slug=${encodeURIComponent(post.slug)}">
      <span class="blog-list__date">${formatPublishedDate(post.publishedAt)}</span>
      <h2 class="blog-list__title">${escapeHtml(post.title)}</h2>
      <p class="blog-list__excerpt">${escapeHtml(post.excerpt)}</p>
    </a>
  `;
}

/** Post titles/excerpts are plain text (not Markdown) — escape before inserting via innerHTML. */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadPosts(): Promise<void> {
  const posts = await fetchPublishedPosts(getApiBaseUrl());
  loadingEl.hidden = true;

  if (posts === null) {
    errorEl.hidden = false;
    return;
  }

  if (posts.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  listEl.innerHTML = posts.map(renderPostCard).join('');
  listEl.hidden = false;
}

void loadPosts();
