import { describe, it, expect, beforeEach, vi } from 'vitest';

// script.ts wires listeners immediately on import (it assumes the DOM is
// already parsed, matching how it's loaded at the end of <body>). So each
// test builds the fixture DOM first, then dynamically imports a fresh copy
// of the module — vi.resetModules() ensures re-importing actually re-runs
// the module body instead of returning a cached instance.

const FIXTURE = `
  <div id="scroll-progress"></div>

  <header id="site-header">
    <button id="theme-toggle"><span id="theme-toggle-thumb"></span></button>
    <ul>
      <li><a class="site-header__nav-link" data-section="services" href="#services">Services</a></li>
      <li><a class="site-header__nav-link" data-section="work" href="#work">Work</a></li>
    </ul>
    <button id="menu-btn" aria-expanded="false"></button>
  </header>

  <div class="service-card"></div>

  <div id="mobile-nav">
    <a class="mobile-nav__link" href="#services">Services</a>
  </div>

  <section id="services"><div class="fade-up"></div></section>
  <section id="work"></section>
  <section id="about"></section>
  <section id="skills"></section>
  <section id="faq"></section>

  <div class="portfolio__filters">
    <button class="portfolio__filter-btn portfolio__filter-btn--active" data-filter="all"></button>
    <button class="portfolio__filter-btn" data-filter="web"></button>
  </div>
  <div class="portfolio__grid">
    <article class="portfolio__item" data-category="web"></article>
    <article class="portfolio__item" data-category="game"></article>
  </div>

  <div class="faq__list">
    <div class="faq__item">
      <button class="faq__question" aria-expanded="false"></button>
    </div>
    <div class="faq__item">
      <button class="faq__question" aria-expanded="false"></button>
    </div>
  </div>

  <form id="contact-form">
    <input id="cf-name" />
    <input id="cf-email" />
    <textarea id="cf-desc"></textarea>
    <p id="cf-error"></p>
    <p id="cf-success"></p>
    <button type="button" id="cf-submit">Send message</button>
  </form>

  <span id="footer-year"></span>
`;

async function loadScript() {
  document.head.innerHTML = '<meta name="api-base-url" content="http://localhost:3000">';
  document.body.innerHTML = FIXTURE;
  vi.resetModules();
  await import('../src/script');
}

beforeEach(() => {
  // jsdom has no IntersectionObserver; script.ts only needs .observe()/.unobserve().
  // @ts-expect-error minimal test stub, not a full IntersectionObserver implementation
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
  };
  // index.html ships with data-theme="dark" on <html> by default; match that
  // here since documentElement persists across tests in the same file.
  document.documentElement.setAttribute('data-theme', 'dark');
});

describe('script.ts DOM wiring', () => {
  it('sets the footer year on load', async () => {
    await loadScript();
    expect(document.getElementById('footer-year')?.textContent).toBe(String(new Date().getFullYear()));
  });

  it('updates the scroll progress bar width on scroll', async () => {
    await loadScript();
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2500, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });

    window.dispatchEvent(new Event('scroll'));

    const bar = document.getElementById('scroll-progress') as HTMLDivElement;
    expect(bar.style.width).toBe('25%');
  });

  it('adds the scrolled header class past the scroll threshold', async () => {
    await loadScript();
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });

    window.dispatchEvent(new Event('scroll'));

    expect(document.getElementById('site-header')?.classList.contains('site-header--scrolled')).toBe(true);
  });

  it('sets spotlight position custom properties on service card pointer move', async () => {
    await loadScript();
    const card = document.querySelector('.service-card') as HTMLElement;
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}),
    });

    card.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 50, bubbles: true }));

    expect(card.style.getPropertyValue('--mx')).toBe('50%');
    expect(card.style.getPropertyValue('--my')).toBe('50%');
  });

  it('toggles the theme and swaps the toggle icon on click', async () => {
    await loadScript();
    const toggle = document.getElementById('theme-toggle') as HTMLButtonElement;
    const thumb = document.getElementById('theme-toggle-thumb') as HTMLSpanElement;

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    toggle.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(thumb.textContent).toBe('☀️');
  });

  it('opens the mobile nav on menu click and closes it on link click', async () => {
    await loadScript();
    const menuBtn = document.getElementById('menu-btn') as HTMLButtonElement;
    const mobileNav = document.getElementById('mobile-nav') as HTMLDivElement;

    menuBtn.click();
    expect(mobileNav.classList.contains('is-open')).toBe(true);

    mobileNav.querySelector<HTMLAnchorElement>('.mobile-nav__link')?.click();
    expect(mobileNav.classList.contains('is-open')).toBe(false);
  });

  it('filters portfolio items when a filter button is clicked', async () => {
    await loadScript();
    const [webItem, gameItem] = Array.from(document.querySelectorAll<HTMLElement>('.portfolio__item'));
    const webFilterBtn = document.querySelector<HTMLButtonElement>('[data-filter="web"]')!;

    webFilterBtn.click();

    expect(webItem.hidden).toBe(false);
    expect(gameItem.hidden).toBe(true);
  });

  it('opens a FAQ item on click and closes it on a second click', async () => {
    await loadScript();
    const [firstItem] = Array.from(document.querySelectorAll<HTMLElement>('.faq__item'));
    const question = firstItem.querySelector('.faq__question') as HTMLButtonElement;

    question.click();
    expect(firstItem.classList.contains('faq__item--open')).toBe(true);

    question.click();
    expect(firstItem.classList.contains('faq__item--open')).toBe(false);
  });

  it('shows an error message when the contact form is submitted incomplete', async () => {
    await loadScript();
    (document.getElementById('cf-name') as HTMLInputElement).value = '';
    document.getElementById('cf-submit')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.getElementById('cf-error')?.classList.contains('is-visible')).toBe(true);
  });

  it('shows a success message and POSTs to the API after a valid submission', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);

    await loadScript();

    (document.getElementById('cf-name') as HTMLInputElement).value = 'Mahmoud';
    (document.getElementById('cf-email') as HTMLInputElement).value = 'mahmoud@example.com';
    (document.getElementById('cf-desc') as HTMLTextAreaElement).value = 'A UE5 project';
    document.getElementById('cf-submit')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      expect(document.getElementById('cf-success')?.classList.contains('is-visible')).toBe(true);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/contact',
      expect.objectContaining({ method: 'POST' })
    );

    vi.unstubAllGlobals();
  });

  it('shows an error message when the backend submission fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await loadScript();

    (document.getElementById('cf-name') as HTMLInputElement).value = 'Mahmoud';
    (document.getElementById('cf-email') as HTMLInputElement).value = 'mahmoud@example.com';
    (document.getElementById('cf-desc') as HTMLTextAreaElement).value = 'A UE5 project';
    document.getElementById('cf-submit')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    await vi.waitFor(() => {
      expect(document.getElementById('cf-error')?.classList.contains('is-visible')).toBe(true);
    });

    expect(document.getElementById('cf-success')?.classList.contains('is-visible')).toBe(false);
    vi.unstubAllGlobals();
  });
});
