import { Router } from 'express';
import {
  getComments,
  createComment,
  toggleCommentReaction,
  deleteComment,
} from '../controllers/comments.controller.js';

const router = Router({ mergeParams: true });

// GET /api/posts/:id/comments
router.get('/:id/comments', getComments);

// POST /api/posts/:id/comments
router.post('/:id/comments', createComment);

// POST /api/posts/:id/comments/:commentId/reactions
router.post('/:id/comments/:commentId/reactions', toggleCommentReaction);

// DELETE /api/posts/:id/comments/:commentId (author only)
router.delete('/:id/comments/:commentId', deleteComment);

export default router;


