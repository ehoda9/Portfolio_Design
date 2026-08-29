const OPEN_CLASS = 'faq__item--open';
const QUESTION_SELECTOR = '.faq__question';

/**
 * Opens `target` and closes every other item in `items` (accordion
 * behaviour — closing `target` if it was already open). Operates on
 * whatever elements are passed in, so tests can build a small detached
 * DOM fixture instead of relying on `document`.
 */
export function toggleFaqItem(items: HTMLElement[], target: HTMLElement): void {
  const wasOpen = target.classList.contains(OPEN_CLASS);

  items.forEach(item => {
    item.classList.remove(OPEN_CLASS);
    item.querySelector(QUESTION_SELECTOR)?.setAttribute('aria-expanded', 'false');
  });

  if (!wasOpen) {
    target.classList.add(OPEN_CLASS);
    target.querySelector(QUESTION_SELECTOR)?.setAttribute('aria-expanded', 'true');
  }
}
