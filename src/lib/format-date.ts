/** Formats an ISO date string as "September 4, 2026". Always in UTC — the
 * post's publish date should read the same for every visitor regardless
 * of their local timezone, not shift by a day near midnight. */
export function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
