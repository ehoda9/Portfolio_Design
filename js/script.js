import { validateContactForm } from './lib/validate-contact-form.js';
import { toggleFaqItem } from './lib/faq.js';
import { shouldShowPortfolioItem } from './lib/portfolio-filter.js';
import { getApiBaseUrl, submitContactMessage } from './lib/contact-api.js';
import { initHeroScene } from './lib/hero-scene.js';
import { initAboutScene } from './lib/about-scene.js';
import { computePointerPercent } from './lib/spotlight.js';
import { initSiteChrome } from './lib/site-chrome.js';
initSiteChrome();
const navLinks = document.querySelectorAll('.site-header__nav-link');
const sectionIds = ['services', 'work', 'about', 'skills', 'faq'];
window.addEventListener('scroll', () => {
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
const heroCanvas = document.getElementById('hero-scene');
if (heroCanvas) {
    void initHeroScene(heroCanvas);
}
const aboutPhotoWrap = document.querySelector('.about__photo-wrap');
const aboutCanvas = document.getElementById('about-scene');
const aboutPhotoImg = document.getElementById('about-photo');
if (aboutPhotoWrap && aboutCanvas && aboutPhotoImg) {
    const aboutObserver = new IntersectionObserver(entries => {
        var _a;
        if (!((_a = entries[0]) === null || _a === void 0 ? void 0 : _a.isIntersecting))
            return;
        aboutObserver.disconnect();
        void initAboutScene(aboutCanvas, aboutPhotoImg.src).then(cleanup => {
            if (cleanup)
                aboutPhotoWrap.classList.add('is-3d');
        });
    }, { threshold: 0.2 });
    aboutObserver.observe(aboutPhotoWrap);
}
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
        const { x, y } = computePointerPercent(card.getBoundingClientRect(), e.clientX, e.clientY);
        card.style.setProperty('--mx', `${x}%`);
        card.style.setProperty('--my', `${y}%`);
    });
});
