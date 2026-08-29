import { describe, it, expect, beforeEach } from 'vitest';
import { closeMobileNav, toggleMobileNav } from '../src/lib/nav';

describe('nav', () => {
  let mobileNav: HTMLElement;
  let menuBtn: HTMLElement;

  beforeEach(() => {
    document.body.style.overflow = '';
    mobileNav = document.createElement('div');
    menuBtn = document.createElement('button');
  });

  describe('toggleMobileNav', () => {
    it('opens a closed nav and locks page scroll', () => {
      const isOpen = toggleMobileNav(mobileNav, menuBtn);

      expect(isOpen).toBe(true);
      expect(mobileNav.classList.contains('is-open')).toBe(true);
      expect(menuBtn.getAttribute('aria-expanded')).toBe('true');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('closes an open nav and restores page scroll', () => {
      mobileNav.classList.add('is-open');

      const isOpen = toggleMobileNav(mobileNav, menuBtn);

      expect(isOpen).toBe(false);
      expect(mobileNav.classList.contains('is-open')).toBe(false);
      expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('closeMobileNav', () => {
    it('closes the nav regardless of its current state', () => {
      mobileNav.classList.add('is-open');

      closeMobileNav(mobileNav, menuBtn);

      expect(mobileNav.classList.contains('is-open')).toBe(false);
      expect(menuBtn.getAttribute('aria-expanded')).toBe('false');
      expect(document.body.style.overflow).toBe('');
    });

    it('is a no-op on scroll lock when already closed', () => {
      closeMobileNav(mobileNav, menuBtn);
      expect(document.body.style.overflow).toBe('');
    });
  });
});
