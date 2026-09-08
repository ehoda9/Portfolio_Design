import { closeMobileNav, toggleMobileNav } from './nav.js';
import { computeScrollProgress } from './scroll-progress.js';

/**
 * Wires up everything common to every page's header/footer chrome:
 * theme toggle, mobile nav, the header's scrolled state, the scroll
 * progress bar, and the footer year. Pages with in-page sections
 * (currently just index.html) additionally wire up active-nav-link
 * highlighting on top of this — that part is page-specific, so it stays
 * in script.ts rather than here.
 */
export function initSiteChrome(): void {
  const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
  const themeThumb = document.getElementById('theme-toggle-thumb') as HTMLSpanElement;
  const root = document.documentElement;

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    themeThumb.textContent = next === 'dark' ? '🌙' : '☀️';
  });

  const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;
  const mobileNav = document.getElementById('mobile-nav') as HTMLDivElement;

  menuBtn.addEventListener('click', () => toggleMobileNav(mobileNav, menuBtn));
  mobileNav.querySelectorAll<HTMLAnchorElement>('.mobile-nav__link').forEach(link => {
    link.addEventListener('click', () => closeMobileNav(mobileNav, menuBtn));
  });

  const header = document.getElementById('site-header') as HTMLElement;
  const scrollProgressBar = document.getElementById('scroll-progress') as HTMLDivElement;

  window.addEventListener(
    'scroll',
    () => {
      const scrolled = window.scrollY > 30;
      header.style.padding = scrolled ? 'var(--sp-3) 0' : 'var(--sp-4) 0';
      header.classList.toggle('site-header--scrolled', scrolled);

      const progress = computeScrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
      scrollProgressBar.style.width = `${progress}%`;
    },
    { passive: true }
  );

  (document.getElementById('footer-year') as HTMLSpanElement).textContent = String(new Date().getFullYear());
}
