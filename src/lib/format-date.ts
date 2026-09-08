/** Formats an ISO date string as "September 4, 2026". */
export function formatPublishedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
