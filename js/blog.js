import { initSiteChrome } from './lib/site-chrome.js';
import { fetchPublishedPosts } from './lib/blog-api.js';
import { formatPublishedDate } from './lib/format-date.js';
import { getApiBaseUrl } from './lib/contact-api.js';
initSiteChrome();
const loadingEl = document.getElementById('blog-list-loading');
const emptyEl = document.getElementById('blog-list-empty');
const errorEl = document.getElementById('blog-list-error');
const listEl = document.getElementById('blog-list');
function renderPostCard(post) {
    return `
    <a class="blog-list__item" href="blog-post.html?slug=${encodeURIComponent(post.slug)}">
      <span class="blog-list__date">${formatPublishedDate(post.publishedAt)}</span>
      <h2 class="blog-list__title">${escapeHtml(post.title)}</h2>
      <p class="blog-list__excerpt">${escapeHtml(post.excerpt)}</p>
    </a>
  `;
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
async function loadPosts() {
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
