import { initSiteChrome } from './lib/site-chrome.js';
import { fetchPostBySlug } from './lib/blog-api.js';
import { formatPublishedDate } from './lib/format-date.js';
import { renderMarkdown } from './lib/blog-render.js';
import { getApiBaseUrl } from './lib/contact-api.js';
initSiteChrome();
const loadingEl = document.getElementById('blog-post-loading');
const notFoundEl = document.getElementById('blog-post-not-found');
const articleEl = document.getElementById('blog-post');
const titleEl = document.getElementById('blog-post-title');
const dateEl = document.getElementById('blog-post-date');
const contentEl = document.getElementById('blog-post-content');
const pageTitleEl = document.getElementById('page-title');
async function loadPost() {
    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) {
        loadingEl.hidden = true;
        notFoundEl.hidden = false;
        return;
    }
    const post = await fetchPostBySlug(getApiBaseUrl(), slug);
    loadingEl.hidden = true;
    if (!post) {
        notFoundEl.hidden = false;
        return;
    }
    titleEl.textContent = post.title;
    dateEl.textContent = formatPublishedDate(post.publishedAt);
    pageTitleEl.textContent = `${post.title} — Mahmoud Mohamed`;
    contentEl.innerHTML = await renderMarkdown(post.content);
    articleEl.hidden = false;
}
void loadPost();
