export async function recordPageView(apiBaseUrl, path) {
    try {
        await fetch(`${apiBaseUrl}/api/analytics/pageview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path }),
        });
    }
    catch {
    }
}
