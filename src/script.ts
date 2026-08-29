import { validateContactForm } from "./lib/validate-contact-form.js";
// Theme toggle
const themeToggle = document.getElementById(
  "theme-toggle",
) as HTMLButtonElement;
const themeThumb = document.getElementById(
  "theme-toggle-thumb",
) as HTMLSpanElement;
const root = document.documentElement;

themeToggle.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  themeThumb.textContent = next === "dark" ? "🌙" : "☀️";
});

// Mobile nav
const menuBtn = document.getElementById("menu-btn") as HTMLButtonElement;
const mobileNav = document.getElementById("mobile-nav") as HTMLDivElement;

function closeMobileNav(): void {
  mobileNav.classList.remove("is-open");
  menuBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

menuBtn.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("is-open");
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
});

mobileNav
  .querySelectorAll<HTMLAnchorElement>(".mobile-nav__link")
  .forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

// Header state + active nav link on scroll
const header = document.getElementById("site-header") as HTMLElement;
const navLinks = document.querySelectorAll<HTMLAnchorElement>(
  ".site-header__nav-link",
);
const sectionIds: string[] = ["services", "work", "about", "skills", "faq"];

window.addEventListener(
  "scroll",
  () => {
    header.style.padding =
      window.scrollY > 30 ? "var(--sp-3) 0" : "var(--sp-4) 0";

    let current = "";
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 140) current = id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle(
        "site-header__nav-link--active",
        link.dataset.section === current,
      );
    });
  },
  { passive: true },
);

// Fade-up reveal on scroll
const revealObserver = new IntersectionObserver(
  (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll<HTMLElement>(".fade-up")
  .forEach((el) => revealObserver.observe(el));

// Portfolio filter
const filterButtons = document.querySelectorAll<HTMLButtonElement>(
  ".portfolio__filter-btn",
);
const portfolioItems =
  document.querySelectorAll<HTMLElement>(".portfolio__item");

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) =>
      b.classList.remove("portfolio__filter-btn--active"),
    );
    btn.classList.add("portfolio__filter-btn--active");

    const filter = btn.dataset.filter;
    portfolioItems.forEach((item) => {
      const show = filter === "all" || item.dataset.category === filter;
      item.hidden = !show;
    });
  });
});

// FAQ accordion
document.querySelectorAll<HTMLElement>(".faq__item").forEach((item) => {
  const question = item.querySelector(".faq__question") as HTMLButtonElement;
  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("faq__item--open");
    document.querySelectorAll(".faq__item").forEach((i) => {
      i.classList.remove("faq__item--open");
      i.querySelector(".faq__question")?.setAttribute("aria-expanded", "false");
    });
    if (!isOpen) {
      item.classList.add("faq__item--open");
      question.setAttribute("aria-expanded", "true");
    }
  });
});

// Contact form
const form = document.getElementById("contact-form") as HTMLFormElement;
const errorMsg = document.getElementById("cf-error") as HTMLParagraphElement;
const successMsg = document.getElementById(
  "cf-success",
) as HTMLParagraphElement;
const submitBtn = document.getElementById("cf-submit") as HTMLButtonElement;

submitBtn.addEventListener("click", () => {
  errorMsg.classList.remove("is-visible");
  successMsg.classList.remove("is-visible");

  const name = (
    document.getElementById("cf-name") as HTMLInputElement
  ).value.trim();
  const email = (
    document.getElementById("cf-email") as HTMLInputElement
  ).value.trim();
  const desc = (
    document.getElementById("cf-desc") as HTMLTextAreaElement
  ).value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!validateContactForm({ name, email, desc })) {
    errorMsg.classList.add("is-visible");
    return;
  }

  // Replace this block with a real submission call (Formspree, EmailJS, your own backend, etc.)
  submitBtn.textContent = "Sending…";
  setTimeout(() => {
    successMsg.classList.add("is-visible");
    submitBtn.textContent = "Send message →";
    form.reset();
  }, 900);
});

// Footer year
(document.getElementById("footer-year") as HTMLSpanElement).textContent =
  String(new Date().getFullYear());
