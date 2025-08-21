import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { checkForToxicity, generateMemePrompt, generateMemeImage } from '../utils/openaiPrompts.js';

function getAuthorId(req) {
  return req.deviceId;
}

async function buildThread(comments, parentId = null) {
  const children = comments.filter((c) => String(c.parentCommentId || '') === String(parentId || ''));
  return Promise.all(
    children.map(async (child) => ({
      ...child.toObject(),
      replies: await buildThread(comments, child._id),
    })),
  );
}

export async function getComments(req, res, next) {
  try {
    const postId = req.params.id;
    const exists = await Post.exists({ _id: postId });
    if (!exists) return res.status(404).json({ error: 'Post not found' });
    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });
    const tree = await buildThread(comments, null);
    res.json({ items: tree });
  } catch (err) {
    next(err);
  }
}

export async function createComment(req, res, next) {
  try {
    const postId = req.params.id;
    const exists = await Post.exists({ _id: postId });
    if (!exists) return res.status(404).json({ error: 'Post not found' });

    const { text, parentCommentId } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });

    if (text.startsWith('/meme ')) {
      const prompt = text.replace('/meme ', '').trim();
      const { caption } = await generateMemePrompt(prompt);
      const url = await generateMemeImage(caption);
      const created = await Comment.create({
        postId,
        authorId: getAuthorId(req),
        text: caption,
        parentCommentId: parentCommentId || null,
        isMeme: true,
        memeUrl: url,
      });
      return res.status(201).json(created);
    }

    const toxicityResult = await checkForToxicity(text);
    if (toxicityResult.isToxic && !req.body.confirmOverride) {
      return res.status(200).json({ warning: true, message: toxicityResult.message });
    }

    const created = await Comment.create({
      postId,
      authorId: getAuthorId(req),
      text,
      parentCommentId: parentCommentId || null,
      isMeme: false,
      memeUrl: null,
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function toggleCommentReaction(req, res, next) {
  try {
    const { type } = req.body || {};
    if (!type) return res.status(400).json({ error: 'type is required' });
    const userId = getAuthorId(req);
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const idx = comment.reactions.findIndex((r) => r.userId === userId);
    if (idx !== -1) {
      const existing = comment.reactions[idx];
      if (existing.type === type) comment.reactions.splice(idx, 1);
      else comment.reactions[idx].type = type;
    } else comment.reactions.push({ userId, type });
    await comment.save();
    res.json({ reactions: comment.reactions });
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.authorId !== getAuthorId(req)) return res.status(403).json({ error: 'Forbidden' });
    await comment.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}


