import { Router } from 'express';
import { requireAdmin } from '../middleware/require-admin.js';
import { validatePostInput } from '../lib/validate-post.js';
import {
  createPost,
  deletePost,
  getPostById,
  getPublishedPostBySlug,
  listPublishedPosts,
  updatePost,
} from '../repositories/posts.js';

export const postsRouter = Router();

postsRouter.get('/', async (_req, res, next) => {
  try {
    const posts = await listPublishedPosts();
    res.status(200).json({ posts });
  } catch (err) {
    next(err);
  }
});

postsRouter.get('/:slug', async (req, res, next) => {
  try {
    const post = await getPublishedPostBySlug(req.params.slug);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.status(200).json({ post });
  } catch (err) {
    next(err);
  }
});

postsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { valid, errors } = validatePostInput(req.body ?? {});
    if (!valid) {
      res.status(400).json({ errors });
      return;
    }

    const post = await createPost(req.body);
    res.status(201).json({ post });
  } catch (err) {
    if (isUniqueSlugViolation(err)) {
      res.status(409).json({ error: 'A post with that slug already exists' });
      return;
    }
    next(err);
  }
});

postsRouter.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'id must be an integer' });
      return;
    }

    const { valid, errors } = validatePostInput(req.body ?? {});
    if (!valid) {
      res.status(400).json({ errors });
      return;
    }

    const existing = await getPostById(id);
    if (!existing) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const post = await updatePost(id, req.body);
    res.status(200).json({ post });
  } catch (err) {
    if (isUniqueSlugViolation(err)) {
      res.status(409).json({ error: 'A post with that slug already exists' });
      return;
    }
    next(err);
  }
});

postsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      res.status(400).json({ error: 'id must be an integer' });
      return;
    }

    const deleted = await deletePost(id);
    if (!deleted) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/** Postgres unique_violation error code — thrown when a slug collides. */
function isUniqueSlugViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === '23505';
}
