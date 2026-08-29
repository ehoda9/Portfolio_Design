import { describe, it, expect, beforeEach } from 'vitest';
import { toggleFaqItem } from '../src/lib/faq';

function makeFaqItem(): HTMLElement {
  const item = document.createElement('div');
  item.className = 'faq__item';
  const question = document.createElement('button');
  question.className = 'faq__question';
  question.setAttribute('aria-expanded', 'false');
  item.appendChild(question);
  return item;
}

describe('toggleFaqItem', () => {
  let items: HTMLElement[];

  beforeEach(() => {
    items = [makeFaqItem(), makeFaqItem(), makeFaqItem()];
  });

  it('opens a closed item and marks its question as expanded', () => {
    toggleFaqItem(items, items[1]);

    expect(items[1].classList.contains('faq__item--open')).toBe(true);
    expect(items[1].querySelector('.faq__question')?.getAttribute('aria-expanded')).toBe('true');
  });

  it('closes every other item when opening one (accordion behaviour)', () => {
    items[0].classList.add('faq__item--open');

    toggleFaqItem(items, items[2]);

    expect(items[0].classList.contains('faq__item--open')).toBe(false);
    expect(items[2].classList.contains('faq__item--open')).toBe(true);
  });

  it('closes an already-open item when clicked again', () => {
    items[1].classList.add('faq__item--open');

    toggleFaqItem(items, items[1]);

    expect(items[1].classList.contains('faq__item--open')).toBe(false);
    expect(items[1].querySelector('.faq__question')?.getAttribute('aria-expanded')).toBe('false');
  });
});
