import { Router } from 'express';
import { isAdminEmail, signAdminToken, verifyAdminPassword } from '../lib/auth.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    // Always run both checks (don't short-circuit on the email check) so a
    // failed login takes roughly the same time either way — avoids letting
    // response timing reveal whether the email was even correct.
    const emailValid = isAdminEmail(email);
    const passwordValid = await verifyAdminPassword(password);

    if (!emailValid || !passwordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.status(200).json({ token: signAdminToken() });
  } catch (err) {
    next(err);
  }
});
