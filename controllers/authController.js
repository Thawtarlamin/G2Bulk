const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { getMe: getG2BulkAccount } = require('../utils/g2bulk');
const passport = require('passport');

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get G2Bulk account info (Admin only)
// @route   GET /api/auth/g2bulk-me
exports.getG2BulkMe = async (req, res) => {
  try {
    const accountInfo = await getG2BulkAccount();
    res.json(accountInfo);
  } catch (error) {
    console.error('G2Bulk getMe error:', error);
    res.status(error.status || 500).json({ 
      message: 'Failed to fetch G2Bulk account info',
      error: error.response || error.message 
    });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = generateToken(req.user._id);
    
    // Check if request is from mobile app (via query parameter or custom header)
    const isMobile = req.query.platform === 'mobile' || req.query.mobile === 'true';
    
    if (isMobile) {
      // For Android: Deep link redirect
      // Format: g2bulk://auth/callback?token=JWT_TOKEN
      const deepLink = `${process.env.MOBILE_DEEP_LINK_SCHEME || 'g2bulk'}://auth/callback?token=${token}`;
      return res.redirect(deepLink);
    }
    
    // For web: Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth login/signup
// @route   GET /api/auth/google
exports.googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'] 
});
