import { Router } from 'express';
import {
  getFeed,
  getById,
  createPost,
  updatePost,
  deletePost,
  togglePostReaction,
  setEventRsvp,
} from '../controllers/posts.controller.js';

const router = Router();

// GET /api/posts - feed with optional kind filter and pagination
router.get('/', getFeed);

// GET /api/posts/:id
router.get('/:id', getById);

// POST /api/posts - create with toxicity warning flow
router.post('/', createPost);

// PATCH /api/posts/:id - update (only author)
router.patch('/:id', updatePost);

// DELETE /api/posts/:id - delete (only author)
router.delete('/:id', deletePost);

// POST /api/posts/:id/reactions - toggle reaction
router.post('/:id/reactions', togglePostReaction);

// POST /api/posts/:id/rsvp - set event RSVP
router.post('/:id/rsvp', setEventRsvp);

export default router;


