import { Router } from 'express';
import { isValidPagePath } from '../lib/validate-analytics.js';
import { recordPageView } from '../repositories/analytics.js';

export const analyticsRouter = Router();

analyticsRouter.post('/pageview', async (req, res, next) => {
  try {
    const path = req.body?.path;
    if (!isValidPagePath(path)) {
      res.status(400).json({ error: 'path is required and must start with /' });
      return;
    }

    await recordPageView(path);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
