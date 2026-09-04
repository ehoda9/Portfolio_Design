export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}

/**
 * POSTs a contact submission to the backend. Returns true on success,
 * false on any failure (validation error, network error, server error) —
 * the caller doesn't need to distinguish why, just whether to show the
 * success or error message.
 */
export async function submitContactMessage(apiBaseUrl: string, submission: ContactSubmission): Promise<boolean> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Reads the API base URL from the <meta name="api-base-url"> tag in index.html. */
export function getApiBaseUrl(): string {
  return document.querySelector('meta[name="api-base-url"]')?.getAttribute('content') ?? '';
}
