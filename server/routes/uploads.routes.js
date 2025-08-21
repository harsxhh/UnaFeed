import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload, processImage } from '../middleware/uploadConfig.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// POST /api/upload/image
router.post('/upload/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'image file is required' });
    const processed = await processImage(req.file.path);
    const root = path.join(__dirname, '..');
    const relative = path.relative(root, processed);
    const publicPath = `/${relative.replace(/\\/g, '/')}`;
    return res.json({ url: publicPath });
  } catch (err) {
    next(err);
  }
});

// POST /api/upload/pdf
router.post('/upload/pdf', upload.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'pdf file is required' });
    const root = path.join(__dirname, '..');
    const relative = path.relative(root, req.file.path);
    const publicPath = `/${relative.replace(/\\/g, '/')}`;
    return res.json({ url: publicPath });
  } catch (err) {
    next(err);
  }
});

export default router;


