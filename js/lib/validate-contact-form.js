const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 500;
export function validateContactForm(values) {
    const name = values.name.trim();
    const email = values.email.trim();
    const desc = values.desc.trim();
    if (!name || !email || !desc)
        return false;
    if (name.length > MAX_FIELD_LENGTH || desc.length > MAX_FIELD_LENGTH)
        return false;
    return EMAIL_RE.test(email);
}
