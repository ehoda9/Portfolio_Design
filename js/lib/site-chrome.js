import { closeMobileNav, toggleMobileNav } from './nav.js';
import { computeScrollProgress } from './scroll-progress.js';
export function initSiteChrome() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeThumb = document.getElementById('theme-toggle-thumb');
    const root = document.documentElement;
    themeToggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        themeThumb.textContent = next === 'dark' ? '🌙' : '☀️';
    });
    const menuBtn = document.getElementById('menu-btn');
    const mobileNav = document.getElementById('mobile-nav');
    menuBtn.addEventListener('click', () => toggleMobileNav(mobileNav, menuBtn));
    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
        link.addEventListener('click', () => closeMobileNav(mobileNav, menuBtn));
    });
    const header = document.getElementById('site-header');
    const scrollProgressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 30;
        header.style.padding = scrolled ? 'var(--sp-3) 0' : 'var(--sp-4) 0';
        header.classList.toggle('site-header--scrolled', scrolled);
        const progress = computeScrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
        scrollProgressBar.style.width = `${progress}%`;
    }, { passive: true });
    document.getElementById('footer-year').textContent = String(new Date().getFullYear());
}
