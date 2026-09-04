import { Router } from 'express';
import { validateContactInput } from '../lib/validate-contact.js';
import { createContactMessage } from '../repositories/contact.js';

export const contactRouter = Router();

contactRouter.post('/', async (req, res, next) => {
  try {
    const { valid, errors } = validateContactInput(req.body ?? {});
    if (!valid) {
      res.status(400).json({ errors });
      return;
    }

    const stored = await createContactMessage(req.body);
    res.status(201).json({ id: stored.id, createdAt: stored.createdAt });
  } catch (err) {
    next(err);
  }
});
