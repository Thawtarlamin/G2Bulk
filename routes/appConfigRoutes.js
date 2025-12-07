const express = require('express');
const router = express.Router();
const {
  getAppConfig,
  upsertAppConfig,
  updateAdText,
  addTag,
  removeTag,
  addViewPager,
  removeViewPager,
  deleteAppConfig
} = require('../controllers/appConfigController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route - anyone can get app config
router.get('/', getAppConfig);

// Admin only routes
router.post('/', protect, admin, upload.array('images', 10), upsertAppConfig);
router.put('/ad-text', protect, admin, updateAdText);
router.post('/tags', protect, admin, addTag);
router.delete('/tags/:index', protect, admin, removeTag);
router.post('/view-pager', protect, admin, upload.single('image'), addViewPager);
router.delete('/view-pager/:index', protect, admin, removeViewPager);
router.delete('/', protect, admin, deleteAppConfig);

module.exports = router;
