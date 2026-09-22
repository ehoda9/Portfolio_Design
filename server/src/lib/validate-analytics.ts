const MAX_PATH_LENGTH = 200;

/** A path must be a non-empty string starting with "/", within a sane length. Pure. */
export function isValidPagePath(path: unknown): path is string {
  return typeof path === 'string' && path.length > 0 && path.length <= MAX_PATH_LENGTH && path.startsWith('/');
}
