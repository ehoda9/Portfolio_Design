export function closeMobileNav(mobileNav, menuBtn) {
    mobileNav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}
export function toggleMobileNav(mobileNav, menuBtn) {
    const isOpen = mobileNav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return isOpen;
}
