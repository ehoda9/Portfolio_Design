import { validateContactForm } from "./lib/validate-contact-form.js";
const themeToggle = document.getElementById("theme-toggle");
const themeThumb = document.getElementById("theme-toggle-thumb");
const root = document.documentElement;
themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    themeThumb.textContent = next === "dark" ? "🌙" : "☀️";
});
const menuBtn = document.getElementById("menu-btn");
const mobileNav = document.getElementById("mobile-nav");
function closeMobileNav() {
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
    .querySelectorAll(".mobile-nav__link")
    .forEach((link) => {
    link.addEventListener("click", closeMobileNav);
});
const header = document.getElementById("site-header");
const navLinks = document.querySelectorAll(".site-header__nav-link");
const sectionIds = ["services", "work", "about", "skills", "faq"];
window.addEventListener("scroll", () => {
    header.style.padding =
        window.scrollY > 30 ? "var(--sp-3) 0" : "var(--sp-4) 0";
    let current = "";
    sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 140)
            current = id;
    });
    navLinks.forEach((link) => {
        link.classList.toggle("site-header__nav-link--active", link.dataset.section === current);
    });
}, { passive: true });
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document
    .querySelectorAll(".fade-up")
    .forEach((el) => revealObserver.observe(el));
const filterButtons = document.querySelectorAll(".portfolio__filter-btn");
const portfolioItems = document.querySelectorAll(".portfolio__item");
filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("portfolio__filter-btn--active"));
        btn.classList.add("portfolio__filter-btn--active");
        const filter = btn.dataset.filter;
        portfolioItems.forEach((item) => {
            const show = filter === "all" || item.dataset.category === filter;
            item.hidden = !show;
        });
    });
});
document.querySelectorAll(".faq__item").forEach((item) => {
    const question = item.querySelector(".faq__question");
    question.addEventListener("click", () => {
        const isOpen = item.classList.contains("faq__item--open");
        document.querySelectorAll(".faq__item").forEach((i) => {
            var _a;
            i.classList.remove("faq__item--open");
            (_a = i.querySelector(".faq__question")) === null || _a === void 0 ? void 0 : _a.setAttribute("aria-expanded", "false");
        });
        if (!isOpen) {
            item.classList.add("faq__item--open");
            question.setAttribute("aria-expanded", "true");
        }
    });
});
const form = document.getElementById("contact-form");
const errorMsg = document.getElementById("cf-error");
const successMsg = document.getElementById("cf-success");
const submitBtn = document.getElementById("cf-submit");
submitBtn.addEventListener("click", () => {
    errorMsg.classList.remove("is-visible");
    successMsg.classList.remove("is-visible");
    const name = document.getElementById("cf-name").value.trim();
    const email = document.getElementById("cf-email").value.trim();
    const desc = document.getElementById("cf-desc").value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!validateContactForm({ name, email, desc })) {
        errorMsg.classList.add("is-visible");
        return;
    }
    submitBtn.textContent = "Sending…";
    setTimeout(() => {
        successMsg.classList.add("is-visible");
        submitBtn.textContent = "Send message →";
        form.reset();
    }, 900);
});
document.getElementById("footer-year").textContent =
    String(new Date().getFullYear());
