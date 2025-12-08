const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword,
  getG2BulkMe,
  googleAuth,
  googleCallback
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');
const passport = require('passport');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe);
router.put('/password', protect, updatePassword);
router.get('/g2bulk-me', protect, admin, getG2BulkMe);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

module.exports = router;
