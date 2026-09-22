import { getApiBaseUrl } from './lib/contact-api.js';
import { initThemeToggle, initPalettePicker } from './lib/site-chrome.js';
import { clearSessionToken, getSessionToken } from './lib/admin-session.js';
import {
  createPost,
  deletePost,
  fetchAdminPost,
  fetchAdminPosts,
  fetchAnalyticsSummary,
  fetchContactMessages,
  updatePost,
  type AdminPostSummary,
  type ContactMessage,
  type AnalyticsSummary,
  type PostFormValues,
} from './lib/admin-api.js';
import { formatPublishedDate } from './lib/format-date.js';
import { formatPostBreakdown, parseEditorMode } from './lib/admin-dashboard.js';

/** Post titles/excerpts/messages are plain text — escape before inserting via innerHTML. */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function confirmAction(message: string): Promise<boolean> {
  const modal = document.getElementById('confirm-modal') as HTMLDivElement;
  const messageEl = document.getElementById('confirm-message') as HTMLParagraphElement;
  const cancelBtn = document.getElementById('confirm-cancel') as HTMLButtonElement;
  const okBtn = document.getElementById('confirm-ok') as HTMLButtonElement;

  messageEl.textContent = message;
  modal.hidden = false;

  return new Promise(resolve => {
    function cleanup(result: boolean): void {
      modal.hidden = true;
      cancelBtn.removeEventListener('click', onCancel);
      okBtn.removeEventListener('click', onOk);
      resolve(result);
    }
    function onCancel(): void {
      cleanup(false);
    }
    function onOk(): void {
      cleanup(true);
    }
    cancelBtn.addEventListener('click', onCancel);
    okBtn.addEventListener('click', onOk);
  });
}

function renderPostsTable(posts: AdminPostSummary[]): void {
  (document.getElementById('posts-loading') as HTMLElement).hidden = true;

  if (posts.length === 0) {
    (document.getElementById('posts-empty') as HTMLElement).hidden = false;
    return;
  }

  const tbody = document.getElementById('posts-table-body') as HTMLElement;
  tbody.innerHTML = posts
    .map(
      post => `
        <tr>
          <td>${escapeHtml(post.title)}</td>
          <td><span class="admin-table__status admin-table__status--${post.status}">${post.status}</span></td>
          <td>${formatPublishedDate(post.updatedAt)}</td>
          <td class="admin-table__actions">
            <a href="admin.html?post=${post.id}" class="admin-table__action-btn">Edit</a>
            <button type="button" class="admin-table__action-btn admin-table__action-btn--danger" data-delete-id="${post.id}">Delete</button>
          </td>
        </tr>
      `
    )
    .join('');

  (document.getElementById('posts-table') as HTMLElement).hidden = false;
}

function renderMessages(messages: ContactMessage[]): void {
  (document.getElementById('messages-loading') as HTMLElement).hidden = true;

  if (messages.length === 0) {
    (document.getElementById('messages-empty') as HTMLElement).hidden = false;
    return;
  }

  const listEl = document.getElementById('messages-list') as HTMLElement;
  listEl.innerHTML = messages
    .map(
      m => `
        <div class="admin-messages__item">
          <div class="admin-messages__meta">
            <strong>${escapeHtml(m.name)}</strong>
            <a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>
            <span class="admin-messages__date">${formatPublishedDate(m.createdAt)}</span>
          </div>
          <p class="admin-messages__body">${escapeHtml(m.message)}</p>
        </div>
      `
    )
    .join('');
}

function renderStats(posts: AdminPostSummary[], messages: ContactMessage[], analytics: AnalyticsSummary | null): void {
  (document.getElementById('stat-views') as HTMLElement).textContent = analytics ? String(analytics.totalViews) : '—';
  (document.getElementById('stat-posts') as HTMLElement).textContent = String(posts.length);

  const published = posts.filter(p => p.status === 'published').length;
  (document.getElementById('stat-posts-breakdown') as HTMLElement).textContent = formatPostBreakdown(published, posts.length - published);

  (document.getElementById('stat-messages') as HTMLElement).textContent = String(messages.length);
}

function wireDeleteButtons(apiBase: string, token: string): void {
  document.getElementById('posts-table-body')?.addEventListener('click', async e => {
    const target = e.target as HTMLElement;
    const deleteId = target.dataset.deleteId;
    if (!deleteId) return;

    const confirmed = await confirmAction('Delete this post? This cannot be undone.');
    if (!confirmed) return;

    const ok = await deletePost(apiBase, token, Number(deleteId));
    if (ok) {
      target.closest('tr')?.remove();
    } else {
      window.alert('Failed to delete the post. Please try again.');
    }
  });
}

async function initDashboard(apiBase: string, token: string): Promise<void> {
  (document.getElementById('dashboard-view') as HTMLElement).hidden = false;

  const posts = await fetchAdminPosts(apiBase, token);

  if (posts === null) {
    // Most likely an expired/invalid session on a fresh load — send back to login.
    clearSessionToken();
    window.location.href = 'admin-login.html';
    return;
  }

  renderPostsTable(posts);
  wireDeleteButtons(apiBase, token);

  const messages = (await fetchContactMessages(apiBase, token)) ?? [];
  renderMessages(messages);

  const analytics = await fetchAnalyticsSummary(apiBase, token);
  renderStats(posts, messages, analytics);
}

async function initEditor(apiBase: string, token: string, mode: { mode: 'new' } | { mode: 'edit'; id: number }): Promise<void> {
  const view = document.getElementById('editor-view') as HTMLElement;
  view.hidden = false;

  const titleHeading = document.getElementById('editor-title') as HTMLElement;
  const form = document.getElementById('post-form') as HTMLFormElement;
  const titleInput = document.getElementById('post-title') as HTMLInputElement;
  const slugInput = document.getElementById('post-slug') as HTMLInputElement;
  const excerptInput = document.getElementById('post-excerpt') as HTMLTextAreaElement;
  const contentInput = document.getElementById('post-content') as HTMLTextAreaElement;
  const statusSelect = document.getElementById('post-status') as HTMLSelectElement;
  const deleteBtn = document.getElementById('editor-delete-btn') as HTMLButtonElement;
  const errorEl = document.getElementById('editor-error') as HTMLElement;
  const successEl = document.getElementById('editor-success') as HTMLElement;

  const editingId = mode.mode === 'edit' ? mode.id : null;

  if (editingId !== null) {
    titleHeading.textContent = 'Edit post';
    deleteBtn.hidden = false;

    const post = await fetchAdminPost(apiBase, token, editingId);
    if (!post) {
      errorEl.textContent = "This post doesn't exist.";
      errorEl.hidden = false;
      form.hidden = true;
      return;
    }

    titleInput.value = post.title;
    slugInput.value = post.slug;
    excerptInput.value = post.excerpt;
    contentInput.value = post.content;
    statusSelect.value = post.status;
  } else {
    titleHeading.textContent = 'New post';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errorEl.hidden = true;
    successEl.hidden = true;

    const values: PostFormValues = {
      title: titleInput.value.trim(),
      slug: slugInput.value.trim(),
      excerpt: excerptInput.value.trim(),
      content: contentInput.value,
      status: statusSelect.value as 'draft' | 'published',
    };

    const result = editingId !== null ? await updatePost(apiBase, token, editingId, values) : await createPost(apiBase, token, values);

    if (!result.ok) {
      errorEl.textContent = result.errors?.join(', ') || 'Failed to save the post.';
      errorEl.hidden = false;
      return;
    }

    successEl.hidden = false;
    if (editingId === null) {
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 800);
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (editingId === null) return;
    const confirmed = await confirmAction('Delete this post? This cannot be undone.');
    if (!confirmed) return;

    const ok = await deletePost(apiBase, token, editingId);
    if (ok) {
      window.location.href = 'admin.html';
    } else {
      errorEl.textContent = 'Failed to delete the post.';
      errorEl.hidden = false;
    }
  });
}

async function init(): Promise<void> {
  const token = getSessionToken();
  if (!token) {
    window.location.href = 'admin-login.html';
    return;
  }

  initThemeToggle();
  initPalettePicker();

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    clearSessionToken();
    window.location.href = 'admin-login.html';
  });

  (document.getElementById('auth-checking') as HTMLElement).hidden = true;

  const apiBase = getApiBaseUrl();
  const editorMode = parseEditorMode(window.location.search);

  if (editorMode) {
    await initEditor(apiBase, token, editorMode);
  } else {
    await initDashboard(apiBase, token);
  }
}

void init();
