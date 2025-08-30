const mongoose = require('mongoose');
const slugify = require('slugify');

// New nested Blog schema matching frontend contract and business rules
const authorSubSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // store as string per 2B? Actually 2B = server ObjectId, but we expose string
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String }
  },
  { _id: false }
);

const categorySubSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    slug: { type: String, trim: true }
  },
  { _id: false }
);

const metadataSubSchema = new mongoose.Schema(
  {
    readTime: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' }
  },
  { _id: false }
);

const seoSubSchema = new mongoose.Schema(
  {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: { type: [String], default: [] },
    canonicalUrl: { type: String, default: null }
  },
  { _id: false }
);

const engagementSubSchema = new mongoose.Schema(
  {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 }
  },
  { _id: false }
);

const timestampsSubSchema = new mongoose.Schema(
  {
    createdAt: { type: Date },
    updatedAt: { type: Date },
    publishedAt: { type: Date, default: null },
    lastViewedAt: { type: Date, default: null }
  },
  { _id: false }
);

const featuredImageSubSchema = new mongoose.Schema(
  {
    url: { type: String },
    alt: { type: String },
    caption: { type: String }
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    // Server will use ObjectId _id; we return it as string to client
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String },
    content: { type: String, required: true }, // HTML content

    // Business fields
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    visibility: { type: String, enum: ['pending', 'approved', 'rejected', 'hidden'], default: 'pending', index: true },

    author: { type: authorSubSchema, required: true },
    category: { type: categorySubSchema, default: () => ({}) },
    tags: { type: [String], default: [] },
    metadata: { type: metadataSubSchema, default: () => ({}) },
    seo: { type: seoSubSchema, default: () => ({}) },
    engagement: { type: engagementSubSchema, default: () => ({}) },
    timestamps: { type: timestampsSubSchema, default: () => ({}) },

    featured: { type: Boolean, default: false },
  featuredImage: { type: featuredImageSubSchema, default: () => ({}) },

  // Internal tracking for likes per user (not exposed to clients)
  likedBy: { type: [String], default: [] },

  version: { type: Number, default: 1 },
  revisions: { type: [Object], default: [] },
  isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'blogs' }
);

// Indexes for common queries
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ 'author.id': 1, 'timestamps.createdAt': -1 });
blogSchema.index({ status: 1, visibility: 1 });

// Pre-save helpers: slug, excerpt, timestamps mapping
blogSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.isModified('content')) {
    const plain = (this.content || '').replace(/<[^>]*>/g, '');
    const summary = plain.substring(0, 160);
    this.excerpt = this.excerpt || summary + (plain.length > 160 ? '...' : '');
  }
  // reflect mongoose timestamps into nested timestamps
  if (!this.timestamps) this.timestamps = {};
  this.timestamps.createdAt = this.createdAt || this.timestamps.createdAt || new Date();
  this.timestamps.updatedAt = new Date();
  if (this.isModified('status') && this.status === 'published' && !this.timestamps.publishedAt) {
    this.timestamps.publishedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);