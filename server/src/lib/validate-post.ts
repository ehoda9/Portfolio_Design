const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_TITLE_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 500;
const MAX_CONTENT_LENGTH = 50_000;
const VALID_STATUSES = ['draft', 'published'] as const;

export interface PostInput {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a post create/update payload. Pure — no DOM, no DB — so it's
 * unit tested directly. Every field is required; this covers create.
 * updatePost (Phase 4) treats missing fields as "no error, no partial
 * validation needed" at the route layer.
 */
export function validatePostInput(input: Partial<PostInput>): ValidationResult {
  const errors: string[] = [];

  const slug = input.slug?.trim() ?? '';
  const title = input.title?.trim() ?? '';
  const excerpt = input.excerpt?.trim() ?? '';
  const content = input.content?.trim() ?? '';
  const status = input.status?.trim() ?? '';

  if (!slug) errors.push('slug is required');
  else if (!SLUG_RE.test(slug)) errors.push('slug must be lowercase letters, numbers, and hyphens only');

  if (!title) errors.push('title is required');
  else if (title.length > MAX_TITLE_LENGTH) errors.push(`title must be ${MAX_TITLE_LENGTH} characters or fewer`);

  if (!excerpt) errors.push('excerpt is required');
  else if (excerpt.length > MAX_EXCERPT_LENGTH) errors.push(`excerpt must be ${MAX_EXCERPT_LENGTH} characters or fewer`);

  if (!content) errors.push('content is required');
  else if (content.length > MAX_CONTENT_LENGTH) errors.push(`content must be ${MAX_CONTENT_LENGTH} characters or fewer`);

  if (!status) errors.push('status is required');
  else if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
