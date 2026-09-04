/**
 * Reads CORS_ORIGIN (comma-separated) from the environment. Falls back to
 * the docker-compose default so local dev works with zero config, but a
 * real deployment (frontend and API on different domains) should set
 * this explicitly.
 */
export function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return ['http://localhost:8080'];
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
