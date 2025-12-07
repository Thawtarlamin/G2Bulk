const express = require('express');
const router = express.Router();
const {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  searchTags
} = require('../controllers/tagController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllTags);
router.get('/search/:query', searchTags);
router.get('/:id', getTagById);

// Admin only routes
router.post('/', protect, admin, createTag);
router.put('/:id', protect, admin, updateTag);
router.delete('/:id', protect, admin, deleteTag);

module.exports = router;
