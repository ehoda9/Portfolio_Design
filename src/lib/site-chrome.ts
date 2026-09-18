import { closeMobileNav, toggleMobileNav } from './nav.js';
import { computeScrollProgress, shouldShowScrollTop } from './scroll-progress.js';
import { applyPalette, getStoredPalette } from './palette.js';

/**
 * Wires up everything common to every page's header/footer chrome: theme
 * toggle, mobile nav, the header's scrolled state, the scroll progress
 * bar, the color palette picker, the scroll-to-top button, and the
 * footer year. Pages with in-page sections (currently just index.html)
 * additionally wire up active-nav-link highlighting on top of this —
 * that part is page-specific, so it stays in script.ts rather than here.
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

  // Color palette picker
  const paletteTrigger = document.getElementById('palette-trigger') as HTMLButtonElement;
  const paletteMenu = document.getElementById('palette-menu') as HTMLDivElement;
  const paletteSwatches = Array.from(document.querySelectorAll<HTMLButtonElement>('.palette-picker__swatch'));

  function markActiveSwatch(paletteId: string): void {
    paletteSwatches.forEach(swatch => {
      swatch.classList.toggle('is-active', swatch.dataset.palette === paletteId);
    });
  }

  applyPalette(getStoredPalette());
  markActiveSwatch(getStoredPalette());

  paletteTrigger.addEventListener('click', () => {
    const isOpen = paletteMenu.hidden;
    paletteMenu.hidden = !isOpen;
    paletteTrigger.setAttribute('aria-expanded', String(isOpen));
  });

  paletteSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const id = swatch.dataset.palette;
      if (!id) return;
      applyPalette(id);
      markActiveSwatch(id);
      paletteMenu.hidden = true;
      paletteTrigger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', e => {
    if (!paletteMenu.hidden && !(e.target instanceof Node && (paletteMenu.contains(e.target) || paletteTrigger.contains(e.target)))) {
      paletteMenu.hidden = true;
      paletteTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  const header = document.getElementById('site-header') as HTMLElement;
  const scrollProgressBar = document.getElementById('scroll-progress') as HTMLDivElement;
  const scrollTopBtn = document.getElementById('scroll-top') as HTMLButtonElement;

  window.addEventListener(
    'scroll',
    () => {
      const scrolled = window.scrollY > 30;
      header.style.padding = scrolled ? 'var(--sp-3) 0' : 'var(--sp-4) 0';
      header.classList.toggle('site-header--scrolled', scrolled);

      const progress = computeScrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
      scrollProgressBar.style.width = `${progress}%`;

      scrollTopBtn.classList.toggle('is-visible', shouldShowScrollTop(window.scrollY));
    },
    { passive: true }
  );

  scrollTopBtn.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  (document.getElementById('footer-year') as HTMLSpanElement).textContent = String(new Date().getFullYear());
}
