import Post, { EventPost, LostFoundPost, AnnouncementPost } from '../models/Post.js';
import { checkForToxicity } from '../utils/openaiPrompts.js';

function getAuthorId(req) {
  return req.deviceId;
}

function getModelByKind(kind) {
  switch (kind) {
    case 'Event':
      return EventPost;
    case 'LostFound':
      return LostFoundPost;
    case 'Announcement':
      return AnnouncementPost;
    default:
      return Post;
  }
}

function toggleReaction(doc, userId, type) {
  const existingIndex = doc.reactions.findIndex((r) => r.userId === userId);
  if (existingIndex !== -1) {
    const existing = doc.reactions[existingIndex];
    if (existing.type === type) {
      doc.reactions.splice(existingIndex, 1);
    } else {
      doc.reactions[existingIndex].type = type;
    }
  } else {
    doc.reactions.push({ userId, type });
  }
}

export async function getFeed(req, res, next) {
  try {
    const { kind, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (kind) filter.kind = kind;
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Post.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
}

export async function createPost(req, res, next) {
  try {
    const { kind, title, description } = req.body || {};
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    const toxicityResult = await checkForToxicity(description);
    if (toxicityResult.isToxic && !req.body.confirmOverride) {
      return res.status(200).json({
        warning: true,
        message: toxicityResult.message,
        toxicContent: description,
      });
    }

    const authorId = getAuthorId(req);
    const Model = getModelByKind(kind);
    const base = {
      authorId,
      title,
      description,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    };

    let payload = base;
    if (Model === EventPost) {
      payload = { ...base, date: req.body.date, location: req.body.location };
    } else if (Model === LostFoundPost) {
      payload = {
        ...base,
        itemName: req.body.itemName,
        imageUrl: req.body.imageUrl || null,
        contactInfo: req.body.contactInfo,
        status: req.body.status,
      };
    } else if (Model === AnnouncementPost) {
      payload = {
        ...base,
        pdfUrl: req.body.pdfUrl || null,
        importance: req.body.importance || 'medium',
      };
    }

    const created = await Model.create(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req, res, next) {
  try {
    const authorId = getAuthorId(req);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== authorId) return res.status(403).json({ error: 'Forbidden' });

    const updates = {};
    ['title', 'description', 'tags'].forEach((k) => {
      if (k in req.body) updates[k] = req.body[k];
    });

    if (post.kind === 'Event') {
      ['date', 'location'].forEach((k) => {
        if (k in req.body) updates[k] = req.body[k];
      });
    } else if (post.kind === 'LostFound') {
      ['itemName', 'imageUrl', 'contactInfo', 'status'].forEach((k) => {
        if (k in req.body) updates[k] = req.body[k];
      });
    } else if (post.kind === 'Announcement') {
      ['pdfUrl', 'importance'].forEach((k) => {
        if (k in req.body) updates[k] = req.body[k];
      });
    }

    Object.assign(post, updates);
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req, res, next) {
  try {
    const authorId = getAuthorId(req);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.authorId !== authorId) return res.status(403).json({ error: 'Forbidden' });
    await post.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function togglePostReaction(req, res, next) {
  try {
    const { type } = req.body || {};
    if (!type) return res.status(400).json({ error: 'type is required' });
    const userId = getAuthorId(req);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    toggleReaction(post, userId, type);
    await post.save();
    res.json({ reactions: post.reactions });
  } catch (err) {
    next(err);
  }
}


