import { getApiBaseUrl } from './lib/contact-api.js';
import { adminLogin } from './lib/admin-api.js';
import { getSessionToken, setSessionToken } from './lib/admin-session.js';

// Already signed in — skip straight to the dashboard.
if (getSessionToken()) {
  window.location.href = 'admin.html';
}

const form = document.getElementById('login-form') as HTMLFormElement;
const emailInput = document.getElementById('login-email') as HTMLInputElement;
const passwordInput = document.getElementById('login-password') as HTMLInputElement;
const errorMsg = document.getElementById('login-error') as HTMLParagraphElement;
const submitBtn = document.getElementById('login-submit') as HTMLButtonElement;

form.addEventListener('submit', async e => {
  e.preventDefault();
  errorMsg.hidden = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in…';

  const token = await adminLogin(getApiBaseUrl(), email, password);

  submitBtn.disabled = false;
  submitBtn.textContent = 'Sign in';

  if (!token) {
    errorMsg.hidden = false;
    return;
  }

  setSessionToken(token);
  window.location.href = 'admin.html';
});
