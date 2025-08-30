const sanitizeHtml = require('sanitize-html');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');

// Sanitize options to allow reasonable HTML while blocking scripts
const sanitizeOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'figure', 'figcaption', 'code', 'pre']),
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    '*': ['class']
  },
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
};

// GET /api/blogs?page=1&limit=10&search=term (public summaries)
// Only published + approved + not deleted
exports.getAllBlogs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const search = (req.query.search || '').toString().trim();

    const filter = { status: 'published', visibility: 'approved', isDeleted: false };

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: { $regex: regex } },
        { excerpt: { $regex: regex } },
        { 'author.name': { $regex: regex } },
        { tags: { $in: [regex] } }
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select('title slug excerpt author category tags featured featuredImage metadata engagement timestamps')
        .sort({ 'timestamps.publishedAt': -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter)
    ]);

    return res.json({ success: true, blogs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/suggest?q=term (public) - top 5 lightweight suggestions
exports.suggestBlogs = async (req, res, next) => {
  try {
    const q = (req.query.q || req.query.query || '').toString().trim();
    if (!q) return res.json({ success: true, suggestions: [] });

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const filter = {
      status: 'published',
      visibility: 'approved',
      isDeleted: false,
      $or: [
        { title: { $regex: regex } },
        { 'author.name': { $regex: regex } },
        { tags: { $in: [regex] } }
      ]
    };

    const results = await Blog.find(filter)
      .select('title slug')
      .sort({ 'timestamps.publishedAt': -1 })
      .limit(5)
      .lean();

    const suggestions = results.map(r => ({ title: r.title, slug: r.slug }));
    return res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/:slug (view rules)
// - public if published+approved
// - author can view own drafts
// - admin can view any published (any visibility), not drafts
exports.getBlogBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const user = req.user || null;

    // base query by slug
    const blog = await Blog.findOne({ slug, isDeleted: false }).lean();
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

    const isAuthor = user && blog.author && blog.author.id === user.userId;
    const isAdmin = user && user.role === 'admin';

    const canPublicSee = blog.status === 'published' && blog.visibility === 'approved';
    const adminCanSee = isAdmin && blog.status === 'published';

    if (!(canPublicSee || isAuthor || adminCanSee)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // increment views and update lastViewedAt (non-blocking)
    Blog.updateOne({ _id: blog._id }, {
      $inc: { 'engagement.views': 1 },
      $set: { 'timestamps.lastViewedAt': new Date() }
    }).catch(() => {});

    // Include whether current user has liked this blog
    const liked = !!(user && Array.isArray(blog.likedBy) && blog.likedBy.includes(user.userId));

    return res.json({ success: true, blog, liked });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs (auth required)
// 1A: author object derived from user + profile
exports.createBlog = async (req, res, next) => {
  try {
    const user = req.user;
    const body = req.body || {};

    const cleanedHTML = body.content ? sanitizeHtml(body.content, sanitizeOptions) : '';

    // Author object from JWT and profile
    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ userId: user.userId }).lean();

    const author = {
      id: user.userId,
      name: user.name,
      email: user.email,
      avatar: profile?.profilePicture || '',
      bio: profile?.bio || ''
    };

    const now = new Date();

    const doc = await Blog.create({
      title: body.title,
      slug: body.slug || undefined,
      excerpt: body.excerpt || undefined,
      content: cleanedHTML,
      status: body.status === 'published' ? 'published' : 'draft',
      visibility: 'pending',
      author,
      category: body.category || {},
      tags: Array.isArray(body.tags) ? body.tags : [],
      metadata: body.metadata || {},
      seo: body.seo || {},
      engagement: body.engagement || {},
      timestamps: {
        createdAt: now,
        updatedAt: now,
        publishedAt: body.status === 'published' ? now : null,
        lastViewedAt: null
      },
      featured: !!body.featured,
      featuredImage: body.featuredImage || {},
      version: 1,
      revisions: [],
      isDeleted: false
    });

    return res.status(201).json({ success: true, blog: doc });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate slug. Please choose a different slug.' });
    }
    next(err);
  }
};

// PUT /api/blogs/:id (auth: author or admin)
// Author can edit drafts and their own published posts; admin can edit published posts
exports.updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const user = req.user;

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: 'Blog not found' });

    const isAuthor = blog.author?.id === user.userId;
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    // Apply updates (server-managed fields guarded)
    const mutableFields = ['title', 'slug', 'excerpt', 'category', 'tags', 'seo', 'featured', 'featuredImage', 'metadata'];
    for (const f of mutableFields) if (f in body) blog[f] = body[f];

    if ('content' in body) blog.content = sanitizeHtml(body.content, sanitizeOptions);
    if ('status' in body) blog.status = body.status === 'published' ? 'published' : 'draft';

    // visibility cannot be changed here by authors; admin uses moderation endpoint

    blog.timestamps.updatedAt = new Date();
    if (blog.isModified('status') && blog.status === 'published' && !blog.timestamps.publishedAt) {
      blog.timestamps.publishedAt = new Date();
    }

    await blog.save();
    return res.json({ success: true, blog });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/blogs/:id/visibility (admin moderation)
exports.updateVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { visibility } = req.body || {};
    const allowed = ['pending', 'approved', 'rejected', 'hidden'];
    if (!allowed.includes(visibility)) return res.status(400).json({ success: false, message: 'Invalid visibility' });

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: 'Blog not found' });
    if (blog.status !== 'published') return res.status(400).json({ success: false, message: 'Only published blogs can be moderated' });

    blog.visibility = visibility;
    blog.timestamps.updatedAt = new Date();
    await blog.save();

    return res.json({ success: true, blog });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/blogs/:id (soft delete)
exports.deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: 'Blog not found' });

    const isAuthor = blog.author?.id === user.userId;
    const isAdmin = user.role === 'admin';
    if (!isAuthor && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    blog.isDeleted = true;
    blog.timestamps.updatedAt = new Date();
    await blog.save();

    return res.json({ success: true, message: 'Blog deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/like (toggle like) -> updates engagement.likes
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: 'Blog not found' });

    const idx = blog.likedBy.findIndex(u => u === userId);
    if (idx >= 0) {
      blog.likedBy.splice(idx, 1);
      blog.engagement.likes = Math.max(0, (blog.engagement.likes || 0) - 1);
    } else {
      blog.likedBy.push(userId);
      blog.engagement.likes = (blog.engagement.likes || 0) + 1;
    }

    blog.timestamps.updatedAt = new Date();
    await blog.save();
    return res.json({ success: true, likes: blog.engagement.likes, liked: idx < 0 });
  } catch (err) {
    next(err);
  }
};

// POST /api/blogs/:id/comment (kept as is if you still use separate Comment model)
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Accept both { content } and legacy { text }
    const content = (req.body && (req.body.content || req.body.text)) || '';

    const blog = await Blog.findById(id);
    if (!blog || blog.isDeleted) return res.status(404).json({ success: false, message: 'Blog not found' });

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    const comment = await Comment.create({ blogId: id, userId: req.user.userId, content: content.trim() });
    blog.engagement.comments = (blog.engagement.comments || 0) + 1;
    blog.timestamps.updatedAt = new Date();
    await blog.save();

    return res.status(201).json({ success: true, comment: { _id: comment._id, content: comment.content, likesCount: comment.likesCount, parentCommentId: comment.parentCommentId, createdAt: comment.createdAt } });
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/:id/comments
exports.getComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ blogId: id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, comments });
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/mine (auth): all of author’s blogs
exports.getMyBlogs = async (req, res, next) => {
  try {
    const user = req.user;
    const blogs = await Blog.find({ 'author.id': user.userId, isDeleted: false })
      .sort({ 'timestamps.updatedAt': -1 })
      .lean();
    return res.json({ success: true, blogs });
  } catch (err) {
    next(err);
  }
};

// GET /api/blogs/moderation (admin): published with visibility != approved
exports.getForModeration = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published', visibility: { $in: ['pending', 'rejected', 'hidden'] }, isDeleted: false })
      .sort({ 'timestamps.publishedAt': -1 })
      .lean();
    return res.json({ success: true, blogs });
  } catch (err) {
    next(err);
  }
};