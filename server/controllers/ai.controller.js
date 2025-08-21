import { getClassificationPrompt, generateMemePrompt, generateMemeImage } from '../utils/openaiPrompts.js';

export async function classify(req, res, next) {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    const result = await getClassificationPrompt(text);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function memePreview(req, res, next) {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    const { caption, style } = await generateMemePrompt(text);
    const imageUrl = await generateMemeImage(`${caption} in style ${style}`);
    return res.json({ caption, style, imageUrl });
  } catch (err) {
    next(err);
  }
}


