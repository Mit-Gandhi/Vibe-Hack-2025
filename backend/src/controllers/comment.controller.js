const { z } = require('zod');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { getClient } = require('../utils/redis');

// Zod schemas
const createSchema = z.object({
  content: z.string().trim().min(1, 'content is required').max(2000),
  parentCommentId: z.string().trim().uuid().optional().or(z.string().length(24)).optional().or(z.null()).optional()
}).strict();

// Helper: map comment to response shape
function mapComment(doc, user) {
  return {
    _id: doc._id.toString(),
    content: doc.content,
    likesCount: doc.likesCount,
    parentCommentId: doc.parentCommentId ? doc.parentCommentId.toString() : null,
    createdAt: doc.createdAt,
    user: {
      name: user?.name || '',
      username: user?.username || ''
    }
  };
}

// POST /api/comments/:blogId
exports.create = async (req, res, next) => {
  try {
    // Debug logs (remove in production)
    console.log('POST /api/comments/:blogId body:', req.body);
    console.log('POST /api/comments/:blogId headers.authorization:', req.headers.authorization);

    const blogId = req.params.blogId;
    if (!mongoose.isValidObjectId(blogId)) return res.status(400).json({ success: false, message: 'Invalid blogId' });

    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten() });
    }

    const { content, parentCommentId } = parsed.data;

    if (parentCommentId && !mongoose.isValidObjectId(parentCommentId)) {
      return res.status(400).json({ success: false, message: 'Invalid parentCommentId' });
    }

    const comment = await Comment.create({
      blogId,
      userId: req.user.userId,
      content,
      parentCommentId: parentCommentId || null
    });

    // Invalidate cache for this blog
    try {
      const redis = await getClient();
      await redis.del(`comments:${blogId}`);
    } catch (_) {}

    return res.status(201).json({ success: true, comment: { _id: comment._id, content: comment.content, likesCount: comment.likesCount, parentCommentId: comment.parentCommentId, createdAt: comment.createdAt } });
  } catch (err) {
    next(err);
  }
};

// GET /api/comments/:blogId
exports.listByBlog = async (req, res, next) => {
  try {
    const blogId = req.params.blogId;
    if (!mongoose.isValidObjectId(blogId)) return res.status(400).json({ success: false, message: 'Invalid blogId' });

    // Try cache
    try {
      const redis = await getClient();
      const cached = await redis.get(`comments:${blogId}`);
      if (cached) return res.json({ success: true, comments: JSON.parse(cached) });
    } catch (_) {}

    const comments = await Comment.find({ blogId: blogId })
      .sort({ createdAt: 1 })
      .lean();

    const userIds = [...new Set(comments.map(c => c.userId?.toString()).filter(Boolean))];
    const users = await User.find({ _id: { $in: userIds } }).select('name username').lean();
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const result = comments.map(c => mapComment(c, userMap.get(c.userId.toString())));

    // Cache for 30s
    try {
      const redis = await getClient();
      await redis.setEx(`comments:${blogId}`, 30, JSON.stringify(result));
    } catch (_) {}

    return res.json({ success: true, comments: result });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/comments/:id/like
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    // Simple toggle via a per-user like set stored in memory would not scale. Use a liked set in Redis per comment.
    // Key: comment_likes:<id>, member: userId
    let liked = false;
    try {
      const redis = await getClient();
      const key = `comment_likes:${id}`;
      const isMember = await redis.sIsMember(key, req.user.userId);
      if (isMember) {
        await redis.sRem(key, req.user.userId);
        comment.likesCount = Math.max(0, (comment.likesCount || 0) - 1);
        liked = false;
      } else {
        await redis.sAdd(key, req.user.userId);
        comment.likesCount = (comment.likesCount || 0) + 1;
        liked = true;
      }
    } catch (_) {
      // Fallback without Redis: always increment (idempotency lost). Prefer Redis path in production.
      comment.likesCount = (comment.likesCount || 0) + 1;
      liked = true;
    }

    await comment.save();

    // Invalidate blog comments cache as like counts changed
    try {
      const redis = await getClient();
      await redis.del(`comments:${comment.blogId.toString()}`);
    } catch (_) {}

    return res.json({ success: true, comment: { _id: comment._id, likesCount: comment.likesCount, liked } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/comments/:id
exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = comment.userId.toString() === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const blogIdStr = comment.blogId.toString();

    // Delete comment and its replies
    await Comment.deleteMany({ $or: [ { _id: id }, { parentCommentId: id } ] });

    // Invalidate cache
    try {
      const redis = await getClient();
      await redis.del(`comments:${blogIdStr}`);
    } catch (_) {}

    return res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};