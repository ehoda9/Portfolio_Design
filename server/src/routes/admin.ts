import { Router } from 'express';
import { requireAdmin } from '../middleware/require-admin.js';
import { getPostById, listAllPosts } from '../repositories/posts.js';
import { listContactMessages } from '../repositories/contact.js';
import { getAnalyticsSummary } from '../repositories/analytics.js';

/**
 * Read endpoints that only make sense for the dashboard — the full post
 * list (drafts included), contact submissions, and analytics — grouped
 * under one admin-only namespace, separate from the public resource
 * routes (`/api/posts`, `/api/contact`) which stay focused on their own
 * public/write concerns.
 */
export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/posts', async (_req, res, next) => {
  try {
    const posts = await listAllPosts();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/posts/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'id must be an integer' });
      return;
    }

    const post = await getPostById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/contact-messages', async (_req, res, next) => {
  try {
    const messages = await listContactMessages();
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/analytics/summary', async (_req, res, next) => {
  try {
    const summary = await getAnalyticsSummary();
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
});
