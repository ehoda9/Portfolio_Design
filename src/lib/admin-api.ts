export interface AdminPostSummary {
  id: number;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminPostDetail {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  viewsByPath: { path: string; count: number }[];
  viewsLast7Days: { date: string; count: number }[];
}

export interface PostFormValues {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
}

/** Logs in. Returns the JWT on success, or null on any failure (wrong credentials, network error, etc). */
export async function adminLogin(apiBaseUrl: string, email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    return data.token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/** Generic admin GET. Returns null on any failure, including a 401 (expired/invalid session). */
async function adminGet<T>(apiBaseUrl: string, path: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBaseUrl}${path}`, { headers: authHeaders(token) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchAdminPosts(apiBaseUrl: string, token: string): Promise<AdminPostSummary[] | null> {
  const data = await adminGet<{ posts: AdminPostSummary[] }>(apiBaseUrl, '/api/admin/posts', token);
  return data?.posts ?? null;
}

export async function fetchAdminPost(apiBaseUrl: string, token: string, id: number): Promise<AdminPostDetail | null> {
  const data = await adminGet<{ post: AdminPostDetail }>(apiBaseUrl, `/api/admin/posts/${id}`, token);
  return data?.post ?? null;
}

export async function fetchContactMessages(apiBaseUrl: string, token: string): Promise<ContactMessage[] | null> {
  const data = await adminGet<{ messages: ContactMessage[] }>(apiBaseUrl, '/api/admin/contact-messages', token);
  return data?.messages ?? null;
}

export async function fetchAnalyticsSummary(apiBaseUrl: string, token: string): Promise<AnalyticsSummary | null> {
  return adminGet<AnalyticsSummary>(apiBaseUrl, '/api/admin/analytics/summary', token);
}

export interface SaveResult {
  ok: boolean;
  status: number;
  errors?: string[];
}

export async function createPost(apiBaseUrl: string, token: string, values: PostFormValues): Promise<SaveResult> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/posts`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(values),
    });
    const body = res.ok ? undefined : ((await res.json().catch(() => ({}))) as { errors?: string[]; error?: string });
    return { ok: res.ok, status: res.status, errors: body?.errors ?? (body?.error ? [body.error] : undefined) };
  } catch {
    return { ok: false, status: 0, errors: ['Network error'] };
  }
}

export async function updatePost(apiBaseUrl: string, token: string, id: number, values: PostFormValues): Promise<SaveResult> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/posts/${id}`, {
      method: 'PUT',
      headers: authHeaders(token),
      body: JSON.stringify(values),
    });
    const body = res.ok ? undefined : ((await res.json().catch(() => ({}))) as { errors?: string[]; error?: string });
    return { ok: res.ok, status: res.status, errors: body?.errors ?? (body?.error ? [body.error] : undefined) };
  } catch {
    return { ok: false, status: 0, errors: ['Network error'] };
  }
}

export async function deletePost(apiBaseUrl: string, token: string, id: number): Promise<boolean> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/posts/${id}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
    return res.ok;
  } catch {
    return false;
  }
}
