import { validateContactForm } from './lib/validate-contact-form.js';
import { closeMobileNav, toggleMobileNav } from './lib/nav.js';
import { toggleFaqItem } from './lib/faq.js';
import { shouldShowPortfolioItem } from './lib/portfolio-filter.js';
import { getApiBaseUrl, submitContactMessage } from './lib/contact-api.js';
import { initHeroScene } from './lib/hero-scene.js';
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
const navLinks = document.querySelectorAll('.site-header__nav-link');
const sectionIds = ['services', 'work', 'about', 'skills', 'faq'];
window.addEventListener('scroll', () => {
    header.style.padding = window.scrollY > 30 ? 'var(--sp-3) 0' : 'var(--sp-4) 0';
    let current = '';
    sectionIds.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 140)
            current = id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('site-header__nav-link--active', link.dataset.section === current);
    });
}, { passive: true });
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));
const filterButtons = document.querySelectorAll('.portfolio__filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio__item');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        var _a;
        filterButtons.forEach(b => b.classList.remove('portfolio__filter-btn--active'));
        btn.classList.add('portfolio__filter-btn--active');
        const filter = (_a = btn.dataset.filter) !== null && _a !== void 0 ? _a : 'all';
        portfolioItems.forEach(item => {
            item.hidden = !shouldShowPortfolioItem(filter, item.dataset.category);
        });
    });
});
const faqItems = Array.from(document.querySelectorAll('.faq__item'));
faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');
    question.addEventListener('click', () => toggleFaqItem(faqItems, item));
});
const form = document.getElementById('contact-form');
const errorMsg = document.getElementById('cf-error');
const successMsg = document.getElementById('cf-success');
const submitBtn = document.getElementById('cf-submit');
submitBtn.addEventListener('click', async () => {
    errorMsg.classList.remove('is-visible');
    successMsg.classList.remove('is-visible');
    const name = document.getElementById('cf-name').value;
    const email = document.getElementById('cf-email').value;
    const desc = document.getElementById('cf-desc').value;
    if (!validateContactForm({ name, email, desc })) {
        errorMsg.classList.add('is-visible');
        return;
    }
    submitBtn.textContent = 'Sending…';
    const ok = await submitContactMessage(getApiBaseUrl(), { name, email, message: desc });
    submitBtn.textContent = 'Send message';
    if (ok) {
        successMsg.classList.add('is-visible');
        form.reset();
    }
    else {
        errorMsg.classList.add('is-visible');
    }
});
document.getElementById('footer-year').textContent = String(new Date().getFullYear());
const heroCanvas = document.getElementById('hero-scene');
if (heroCanvas) {
    void initHeroScene(heroCanvas);
}
