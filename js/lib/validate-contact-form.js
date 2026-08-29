const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function validateContactForm(values) {
    const name = values.name.trim();
    const email = values.email.trim();
    const desc = values.desc.trim();
    if (!name || !email || !desc)
        return false;
    return EMAIL_RE.test(email);
}
