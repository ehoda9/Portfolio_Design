import { validateContactForm } from './lib/validate-contact-form.js';
import { closeMobileNav, toggleMobileNav } from './lib/nav.js';
import { toggleFaqItem } from './lib/faq.js';
import { shouldShowPortfolioItem } from './lib/portfolio-filter.js';
import { getApiBaseUrl, submitContactMessage } from './lib/contact-api.js';
import { initHeroScene } from './lib/hero-scene.js';
import { computeScrollProgress } from './lib/scroll-progress.js';
import { computePointerPercent } from './lib/spotlight.js';

// Theme toggle
const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
const themeThumb = document.getElementById('theme-toggle-thumb') as HTMLSpanElement;
const root = document.documentElement;

themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  themeThumb.textContent = next === 'dark' ? '🌙' : '☀️';
});

// Mobile nav
const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;
const mobileNav = document.getElementById('mobile-nav') as HTMLDivElement;

menuBtn.addEventListener('click', () => toggleMobileNav(mobileNav, menuBtn));

mobileNav.querySelectorAll<HTMLAnchorElement>('.mobile-nav__link').forEach(link => {
  link.addEventListener('click', () => closeMobileNav(mobileNav, menuBtn));
});

// Header state + active nav link on scroll
const header = document.getElementById('site-header') as HTMLElement;
const navLinks = document.querySelectorAll<HTMLAnchorElement>('.site-header__nav-link');
const sectionIds: string[] = ['services', 'work', 'about', 'skills', 'faq'];
const scrollProgressBar = document.getElementById('scroll-progress') as HTMLDivElement;

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 30;
  header.style.padding = scrolled ? 'var(--sp-3) 0' : 'var(--sp-4) 0';
  header.classList.toggle('site-header--scrolled', scrolled);

  const progress = computeScrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
  scrollProgressBar.style.width = `${progress}%`;

  let current = '';
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 140) current = id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('site-header__nav-link--active', link.dataset.section === current);
  });
}, { passive: true });

// Fade-up reveal on scroll
const revealObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll<HTMLElement>('.fade-up').forEach(el => revealObserver.observe(el));

// Portfolio filter
const filterButtons = document.querySelectorAll<HTMLButtonElement>('.portfolio__filter-btn');
const portfolioItems = document.querySelectorAll<HTMLElement>('.portfolio__item');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('portfolio__filter-btn--active'));
    btn.classList.add('portfolio__filter-btn--active');

    const filter = btn.dataset.filter ?? 'all';
    portfolioItems.forEach(item => {
      item.hidden = !shouldShowPortfolioItem(filter, item.dataset.category);
    });
  });
});

// FAQ accordion
const faqItems = Array.from(document.querySelectorAll<HTMLElement>('.faq__item'));

faqItems.forEach(item => {
  const question = item.querySelector('.faq__question') as HTMLButtonElement;
  question.addEventListener('click', () => toggleFaqItem(faqItems, item));
});

// Contact form
const form = document.getElementById('contact-form') as HTMLFormElement;
const errorMsg = document.getElementById('cf-error') as HTMLParagraphElement;
const successMsg = document.getElementById('cf-success') as HTMLParagraphElement;
const submitBtn = document.getElementById('cf-submit') as HTMLButtonElement;

submitBtn.addEventListener('click', async () => {
  errorMsg.classList.remove('is-visible');
  successMsg.classList.remove('is-visible');

  const name = (document.getElementById('cf-name') as HTMLInputElement).value;
  const email = (document.getElementById('cf-email') as HTMLInputElement).value;
  const desc = (document.getElementById('cf-desc') as HTMLTextAreaElement).value;

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
  } else {
    errorMsg.classList.add('is-visible');
  }
});

// Footer year
(document.getElementById('footer-year') as HTMLSpanElement).textContent = String(new Date().getFullYear());

// Hero 3D scene — a no-op if WebGL is unavailable or motion is reduced
const heroCanvas = document.getElementById('hero-scene') as HTMLCanvasElement | null;
if (heroCanvas) {
  void initHeroScene(heroCanvas);
}

// Spotlight-follow-cursor glow on service cards
document.querySelectorAll<HTMLElement>('.service-card').forEach(card => {
  card.addEventListener('pointermove', (e: PointerEvent) => {
    const { x, y } = computePointerPercent(card.getBoundingClientRect(), e.clientX, e.clientY);
    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
  });
});
