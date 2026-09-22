import { closeMobileNav, toggleMobileNav } from './nav.js';
import { computeScrollProgress, shouldShowScrollTop } from './scroll-progress.js';
import { applyPalette, getStoredPalette } from './palette.js';
export function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeThumb = document.getElementById('theme-toggle-thumb');
    const root = document.documentElement;
    themeToggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        themeThumb.textContent = next === 'dark' ? '🌙' : '☀️';
    });
}
export function initMobileNav() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    menuBtn.addEventListener('click', () => toggleMobileNav(mobileNav, menuBtn));
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
        link.addEventListener('click', () => closeMobileNav(mobileNav, menuBtn));
    });
}
export function initPalettePicker() {
    const paletteTrigger = document.getElementById('palette-trigger');
    const paletteMenu = document.getElementById('palette-menu');
    const paletteSwatches = Array.from(document.querySelectorAll('.palette-picker__swatch'));
    function markActiveSwatch(paletteId) {
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
            if (!id)
                return;
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
}
export function initScrollChrome() {
    const header = document.getElementById('site-header');
    const scrollProgressBar = document.getElementById('scroll-progress');
    const scrollTopBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 30;
        header.style.padding = scrolled ? 'var(--sp-3) 0' : 'var(--sp-4) 0';
        header.classList.toggle('site-header--scrolled', scrolled);
        const progress = computeScrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
        scrollProgressBar.style.width = `${progress}%`;
        scrollTopBtn.classList.toggle('is-visible', shouldShowScrollTop(window.scrollY));
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
}
export function initFooterYear() {
    document.getElementById('footer-year').textContent = String(new Date().getFullYear());
}
export function initSiteChrome() {
    initThemeToggle();
    initMobileNav();
    initPalettePicker();
    initScrollChrome();
    initFooterYear();
}
