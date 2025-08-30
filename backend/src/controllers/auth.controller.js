const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { signToken } = require('../utils/jwt');
const { sendOtpEmail } = require('../utils/email');

const OTP_EXP_MIN = 5;

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/signup/request
exports.requestSignup = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body || {};
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, username, email and password are required' });
    }

    const loweredEmail = email.toLowerCase();
    const loweredUsername = username.toLowerCase();

    // Check for duplicates on username or email
    const existingByEmail = await User.findOne({ email: loweredEmail });
    if (existingByEmail) {
      return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });
    }
    const existingByUsername = await User.findOne({ username: loweredUsername });
    if (existingByUsername) {
      return res.status(409).json({ success: false, message: 'Username already taken. Please choose another.' });
    }

    // Create OTP and email it
    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    const expiresAt = new Date(Date.now() + OTP_EXP_MIN * 60 * 1000);

    // Upsert OTP doc for this email
    await Otp.findOneAndUpdate(
      { email: loweredEmail },
      { email: loweredEmail, otpHash, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send email
    await sendOtpEmail({ to: loweredEmail, otp });

    return res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/signup/verify
exports.verifySignup = async (req, res, next) => {
  try {
    const { name, username, email, password, otp } = req.body || {};
    if (!name || !username || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'name, username, email, password and otp are required' });
    }

    const loweredEmail = email.toLowerCase();
    const loweredUsername = username.toLowerCase();

    const otpDoc = await Otp.findOne({ email: loweredEmail });
    if (!otpDoc) return res.status(400).json({ success: false, message: 'OTP not found. Please request again.' });
    if (otpDoc.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    const isValid = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });

    // Ensure uniqueness just before creating the account
    const [existingByEmail, existingByUsername] = await Promise.all([
      User.findOne({ email: loweredEmail }),
      User.findOne({ username: loweredUsername })
    ]);
    if (existingByEmail) {
      return res.status(409).json({ success: false, message: 'Email already registered. Please login.' });
    }
    if (existingByUsername) {
      return res.status(409).json({ success: false, message: 'Username already taken. Please choose another.' });
    }

    // Create user
    const user = await User.create({ name, username: loweredUsername, email: loweredEmail, password, role: 'user' });

    // Cleanup OTP after success
    await Otp.deleteOne({ _id: otpDoc._id });

    const payload = { userId: user._id.toString(), name: user.name, email: user.email, role: user.role };
    const token = signToken(payload);

    return res.status(201).json({ success: true, message: 'Account created successfully.', token, username: user.username, email: user.email, user: payload });
  } catch (err) {
    // Handle duplicate key race
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email or username already registered. Please login or choose another.' });
    }
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body || {};
    if (!password || (!email && !username)) {
      return res.status(400).json({ success: false, message: 'Provide username or email and password.' });
    }

    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = await User.findOne({ username: username.toLowerCase() });
    }
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials.' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ success: false, message: 'Invalid credentials.' });

    const payload = { userId: user._id.toString(), name: user.name, email: user.email, role: user.role };
    const token = signToken(payload);

    return res.json({ success: true, message: 'Login successful.', token, user: payload });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile (protected)
exports.profile = async (req, res) => {
  const { name, email, role, userId } = req.user;
  return res.json({ success: true, user: { name, email }, userId, role });
};