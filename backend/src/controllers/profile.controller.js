const Profile = require('../models/Profile');
const User = require('../models/User');

// POST /api/profiles - Create or Update own profile
exports.upsertMyProfile = async (req, res, next) => {
  try {
    const authUserId = req.user?.userId; // from auth middleware
    if (!authUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Only owner can create/update their profile; we take userId from token only
    let {
      fullName,
      bio,
      profilePicture,
      coverImage,
      location,
      skills = [],
      interests = [],
      socialLinks = {},
      // Frontend sends these individual fields
      twitter,
      linkedin,
      github,
      website,
      profession,
      company
    } = req.body || {};

    // Normalize skills to array of strings
    if (skills && !Array.isArray(skills)) {
      if (typeof skills === 'string') {
        skills = skills.split(',').map(s => s.trim()).filter(s => s);
      } else {
        skills = [String(skills)];
      }
    }

    // Normalize interests to array of strings
    if (interests && !Array.isArray(interests)) {
      if (typeof interests === 'string') {
        interests = interests.split(',').map(s => s.trim()).filter(s => s);
      } else {
        interests = [String(interests)];
      }
    }

    // Build socialLinks object from individual fields
    const socialLinksObj = {
      ...socialLinks,
      ...(twitter && { twitter }),
      ...(linkedin && { linkedin }),
      ...(github && { github }),
      ...(website && { website })
    };

    const payload = {
      fullName,
      bio,
      profilePicture,
      coverImage,
      location,
      skills,
      interests,
      socialLinks: socialLinksObj,
      profession,
      company
    };

    // Remove undefined fields to avoid overwriting with undefined
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    const now = new Date();

    // Upsert based on userId and return proper status code (201 for create, 200 for update)
    const result = await Profile.findOneAndUpdate(
      { userId: authUserId },
      { $set: { ...payload, updatedAt: now }, $setOnInsert: { userId: authUserId, createdAt: now } },
      { new: true, upsert: true, rawResult: true }
    );

    const created = !!result?.lastErrorObject?.upserted;
    const profile = result?.value;

    return res.status(created ? 201 : 200).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// GET /api/profiles/:userId - Public profile
exports.getProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId }).populate('userId', 'name username').lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    
    // If fullName is not set in profile, use the user's name as fallback
    if (!profile.fullName && profile.userId && profile.userId.name) {
      profile.fullName = profile.userId.name;
    }
    
    return res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

// GET /api/profiles/me - Auth required
exports.getMyProfile = async (req, res, next) => {
  try {
    const authUserId = req.user?.userId;
    if (!authUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const profile = await Profile.findOne({ userId: authUserId }).populate('userId', 'name username').lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });

    // If fullName is not set in profile, use the user's name as fallback
    if (!profile.fullName && profile.userId && profile.userId.name) {
      profile.fullName = profile.userId.name;
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};