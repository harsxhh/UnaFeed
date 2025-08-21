import { Router } from 'express';
import { classify, memePreview } from '../controllers/ai.controller.js';

const router = Router();

// POST /api/classify
router.post('/classify', classify);

// POST /api/meme/preview -> returns a meme caption and optional image URL
router.post('/meme/preview', memePreview);

export default router;


