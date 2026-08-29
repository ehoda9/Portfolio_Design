/**
 * Closes the mobile nav overlay and resets its trigger button + page scroll
 * lock. Takes the elements as parameters (rather than querying the document
 * itself) so it can be unit tested against detached jsdom elements.
 */
export function closeMobileNav(mobileNav: HTMLElement, menuBtn: HTMLElement): void {
  mobileNav.classList.remove('is-open');
  menuBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/**
 * Toggles the mobile nav open/closed and keeps the trigger button + page
 * scroll lock in sync. Returns the resulting open state.
 */
export function toggleMobileNav(mobileNav: HTMLElement, menuBtn: HTMLElement): boolean {
  const isOpen = mobileNav.classList.toggle('is-open');
  menuBtn.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
  return isOpen;
}
