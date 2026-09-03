import { Router } from 'express';
import { getPublishedPostBySlug, listPublishedPosts } from '../repositories/posts.js';

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
