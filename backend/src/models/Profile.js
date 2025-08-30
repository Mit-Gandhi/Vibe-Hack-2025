const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    github: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, trim: true },
    bio: { type: String, trim: true },
    profilePicture: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    location: { type: String, trim: true },
    profession: { type: String, trim: true },
    company: { type: String, trim: true },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    socialLinks: { type: socialLinksSchema, default: () => ({}) }
  },
  {
    timestamps: true,
    collection: 'profiles'
  }
);

module.exports = mongoose.model('Profile', profileSchema);