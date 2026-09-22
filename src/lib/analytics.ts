/**
 * Records a page view. Fire-and-forget by design: failures are silent —
 * analytics must never block or break the page for a real visitor.
 */
export async function recordPageView(apiBaseUrl: string, path: string): Promise<void> {
  try {
    await fetch(`${apiBaseUrl}/api/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
  } catch {
    // Intentionally ignored — see function doc.
  }
}
