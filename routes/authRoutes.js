const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword,
  getG2BulkMe
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe);
router.put('/password', protect, updatePassword);
router.get('/g2bulk-me', protect, admin, getG2BulkMe);

module.exports = router;
