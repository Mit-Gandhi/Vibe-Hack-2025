const mongoose = require('mongoose');

// Comment schema per new requirements
const commentSchema = new mongoose.Schema(
  {
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Align with backend controllers: accept both 'content' and legacy 'text' when creating
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    likesCount: { type: Number, default: 0 },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false, collection: 'comments' }
);

// Helpful indexes
commentSchema.index({ blogId: 1, createdAt: 1 });
commentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model('Comment', commentSchema);