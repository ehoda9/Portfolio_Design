import { getApiBaseUrl } from './lib/contact-api.js';
import { initThemeToggle, initPalettePicker } from './lib/site-chrome.js';
import { clearSessionToken, getSessionToken } from './lib/admin-session.js';
import { createPost, deletePost, fetchAdminPost, fetchAdminPosts, fetchAnalyticsSummary, fetchContactMessages, updatePost, } from './lib/admin-api.js';
import { formatPublishedDate } from './lib/format-date.js';
import { formatPostBreakdown, parseEditorMode } from './lib/admin-dashboard.js';
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function confirmAction(message) {
    const modal = document.getElementById('confirm-modal');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');
    messageEl.textContent = message;
    modal.hidden = false;
    return new Promise(resolve => {
        function cleanup(result) {
            modal.hidden = true;
            cancelBtn.removeEventListener('click', onCancel);
            okBtn.removeEventListener('click', onOk);
            resolve(result);
        }
        function onCancel() {
            cleanup(false);
        }
        function onOk() {
            cleanup(true);
        }
        cancelBtn.addEventListener('click', onCancel);
        okBtn.addEventListener('click', onOk);
    });
}
function renderPostsTable(posts) {
    document.getElementById('posts-loading').hidden = true;
    if (posts.length === 0) {
        document.getElementById('posts-empty').hidden = false;
        return;
    }
    const tbody = document.getElementById('posts-table-body');
    tbody.innerHTML = posts
        .map(post => `
        <tr>
          <td>${escapeHtml(post.title)}</td>
          <td><span class="admin-table__status admin-table__status--${post.status}">${post.status}</span></td>
          <td>${formatPublishedDate(post.updatedAt)}</td>
          <td class="admin-table__actions">
            <a href="admin.html?post=${post.id}" class="admin-table__action-btn">Edit</a>
            <button type="button" class="admin-table__action-btn admin-table__action-btn--danger" data-delete-id="${post.id}">Delete</button>
          </td>
        </tr>
      `)
        .join('');
    document.getElementById('posts-table').hidden = false;
}
function renderMessages(messages) {
    document.getElementById('messages-loading').hidden = true;
    if (messages.length === 0) {
        document.getElementById('messages-empty').hidden = false;
        return;
    }
    const listEl = document.getElementById('messages-list');
    listEl.innerHTML = messages
        .map(m => `
        <div class="admin-messages__item">
          <div class="admin-messages__meta">
            <strong>${escapeHtml(m.name)}</strong>
            <a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>
            <span class="admin-messages__date">${formatPublishedDate(m.createdAt)}</span>
          </div>
          <p class="admin-messages__body">${escapeHtml(m.message)}</p>
        </div>
      `)
        .join('');
}
function renderStats(posts, messages, analytics) {
    document.getElementById('stat-views').textContent = analytics ? String(analytics.totalViews) : '—';
    document.getElementById('stat-posts').textContent = String(posts.length);
    const published = posts.filter(p => p.status === 'published').length;
    document.getElementById('stat-posts-breakdown').textContent = formatPostBreakdown(published, posts.length - published);
    document.getElementById('stat-messages').textContent = String(messages.length);
}
function wireDeleteButtons(apiBase, token) {
    var _a;
    (_a = document.getElementById('posts-table-body')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', async (e) => {
        var _a;
        const target = e.target;
        const deleteId = target.dataset.deleteId;
        if (!deleteId)
            return;
        const confirmed = await confirmAction('Delete this post? This cannot be undone.');
        if (!confirmed)
            return;
        const ok = await deletePost(apiBase, token, Number(deleteId));
        if (ok) {
            (_a = target.closest('tr')) === null || _a === void 0 ? void 0 : _a.remove();
        }
        else {
            window.alert('Failed to delete the post. Please try again.');
        }
    });
}
async function initDashboard(apiBase, token) {
    var _a;
    document.getElementById('dashboard-view').hidden = false;
    const posts = await fetchAdminPosts(apiBase, token);
    if (posts === null) {
        clearSessionToken();
        window.location.href = 'admin-login.html';
        return;
    }
    renderPostsTable(posts);
    wireDeleteButtons(apiBase, token);
    const messages = (_a = (await fetchContactMessages(apiBase, token))) !== null && _a !== void 0 ? _a : [];
    renderMessages(messages);
    const analytics = await fetchAnalyticsSummary(apiBase, token);
    renderStats(posts, messages, analytics);
}
async function initEditor(apiBase, token, mode) {
    const view = document.getElementById('editor-view');
    view.hidden = false;
    const titleHeading = document.getElementById('editor-title');
    const form = document.getElementById('post-form');
    const titleInput = document.getElementById('post-title');
    const slugInput = document.getElementById('post-slug');
    const excerptInput = document.getElementById('post-excerpt');
    const contentInput = document.getElementById('post-content');
    const statusSelect = document.getElementById('post-status');
    const deleteBtn = document.getElementById('editor-delete-btn');
    const errorEl = document.getElementById('editor-error');
    const successEl = document.getElementById('editor-success');
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
    }
    else {
        titleHeading.textContent = 'New post';
    }
    form.addEventListener('submit', async (e) => {
        var _a;
        e.preventDefault();
        errorEl.hidden = true;
        successEl.hidden = true;
        const values = {
            title: titleInput.value.trim(),
            slug: slugInput.value.trim(),
            excerpt: excerptInput.value.trim(),
            content: contentInput.value,
            status: statusSelect.value,
        };
        const result = editingId !== null ? await updatePost(apiBase, token, editingId, values) : await createPost(apiBase, token, values);
        if (!result.ok) {
            errorEl.textContent = ((_a = result.errors) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'Failed to save the post.';
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
        if (editingId === null)
            return;
        const confirmed = await confirmAction('Delete this post? This cannot be undone.');
        if (!confirmed)
            return;
        const ok = await deletePost(apiBase, token, editingId);
        if (ok) {
            window.location.href = 'admin.html';
        }
        else {
            errorEl.textContent = 'Failed to delete the post.';
            errorEl.hidden = false;
        }
    });
}
async function init() {
    var _a;
    const token = getSessionToken();
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }
    initThemeToggle();
    initPalettePicker();
    (_a = document.getElementById('logout-btn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
        clearSessionToken();
        window.location.href = 'admin-login.html';
    });
    document.getElementById('auth-checking').hidden = true;
    const apiBase = getApiBaseUrl();
    const editorMode = parseEditorMode(window.location.search);
    if (editorMode) {
        await initEditor(apiBase, token, editorMode);
    }
    else {
        await initDashboard(apiBase, token);
    }
}
void init();
