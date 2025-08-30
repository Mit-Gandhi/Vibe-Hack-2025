const router = require('express').Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const requireAdmin = require('../middleware/requireAdmin');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/blog.controller');
const Joi = require('joi');

// Schemas matching new JSON contract
const createBlogSchema = Joi.object({
  title: Joi.string().max(200).when('status', {
    is: 'published',
    then: Joi.string().min(3).required(),
    otherwise: Joi.string().min(1).required()
  }),
  slug: Joi.string().max(220).allow('', null),
  excerpt: Joi.string().allow('', null),
  content: Joi.alternatives().conditional('status', {
    is: 'published',
    then: Joi.string().min(20).required(),
    otherwise: Joi.string().allow('', null)
  }),
  status: Joi.string().valid('draft', 'published').default('draft'),
  category: Joi.object({ name: Joi.string().allow('', null), slug: Joi.string().allow('', null) }).default({}),
  tags: Joi.array().items(Joi.string().trim()).default([]),
  metadata: Joi.object({ readTime: Joi.number(), wordCount: Joi.number(), difficulty: Joi.string().valid('beginner','intermediate','advanced') }).default({}),
  seo: Joi.object({ metaTitle: Joi.string(), metaDescription: Joi.string(), keywords: Joi.array().items(Joi.string()), canonicalUrl: Joi.string().allow(null) }).default({}),
  engagement: Joi.object({ views: Joi.number(), likes: Joi.number(), comments: Joi.number(), shares: Joi.number(), bookmarks: Joi.number() }).default({}),
  timestamps: Joi.object({ createdAt: Joi.date(), updatedAt: Joi.date(), publishedAt: Joi.date().allow(null), lastViewedAt: Joi.date().allow(null) }).default({}),
  featured: Joi.boolean().default(false),
  featuredImage: Joi.object({ url: Joi.string().uri(), alt: Joi.string(), caption: Joi.string() }).default({}),
  version: Joi.number().default(1),
  revisions: Joi.array().items(Joi.object()).default([]),
  isDeleted: Joi.boolean().default(false)
});

const updateBlogSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  slug: Joi.string().max(220),
  excerpt: Joi.string().allow('', null),
  content: Joi.string().min(20),
  status: Joi.string().valid('draft', 'published'),
  category: Joi.object({ name: Joi.string().allow('', null), slug: Joi.string().allow('', null) }),
  tags: Joi.array().items(Joi.string().trim()),
  metadata: Joi.object({ readTime: Joi.number(), wordCount: Joi.number(), difficulty: Joi.string().valid('beginner','intermediate','advanced') }),
  seo: Joi.object({ metaTitle: Joi.string(), metaDescription: Joi.string(), keywords: Joi.array().items(Joi.string()), canonicalUrl: Joi.string().allow(null) }),
  engagement: Joi.object({ views: Joi.number(), likes: Joi.number(), comments: Joi.number(), shares: Joi.number(), bookmarks: Joi.number() }),
  timestamps: Joi.object({ createdAt: Joi.date(), updatedAt: Joi.date(), publishedAt: Joi.date().allow(null), lastViewedAt: Joi.date().allow(null) }),
  featured: Joi.boolean(),
  featuredImage: Joi.object({ url: Joi.string().uri(), alt: Joi.string(), caption: Joi.string() }),
  version: Joi.number(),
  revisions: Joi.array().items(Joi.object()),
  isDeleted: Joi.boolean()
}).min(1);

const visibilitySchema = Joi.object({ visibility: Joi.string().valid('pending', 'approved', 'rejected', 'hidden').required() });

const paginationSchema = Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(50).default(10) });

const commentSchema = Joi.object({ text: Joi.string().min(1).max(1000).required() });

// Public
router.get('/', validate(paginationSchema), ctrl.getAllBlogs);
router.get('/suggest', ctrl.suggestBlogs);
router.get('/:slug', optionalAuth, ctrl.getBlogBySlug);

// Protected
router.get('/mine/all', auth, ctrl.getMyBlogs);
router.get('/moderation/list', auth, requireAdmin, ctrl.getForModeration);
router.post('/', auth, validate(createBlogSchema), ctrl.createBlog);
router.put('/:id', auth, validate(updateBlogSchema), ctrl.updateBlog);
router.patch('/:id/visibility', auth, requireAdmin, validate(visibilitySchema), ctrl.updateVisibility);
router.delete('/:id', auth, ctrl.deleteBlog);
router.post('/:id/like', auth, ctrl.toggleLike);
router.post('/:id/comment', auth, validate(commentSchema), ctrl.addComment);
router.get('/:id/comments', ctrl.getComments);

module.exports = router;