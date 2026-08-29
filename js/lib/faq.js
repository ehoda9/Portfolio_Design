const OPEN_CLASS = 'faq__item--open';
const QUESTION_SELECTOR = '.faq__question';
export function toggleFaqItem(items, target) {
    var _a;
    const wasOpen = target.classList.contains(OPEN_CLASS);
    items.forEach(item => {
        var _a;
        item.classList.remove(OPEN_CLASS);
        (_a = item.querySelector(QUESTION_SELECTOR)) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
        target.classList.add(OPEN_CLASS);
        (_a = target.querySelector(QUESTION_SELECTOR)) === null || _a === void 0 ? void 0 : _a.setAttribute('aria-expanded', 'true');
    }
}
