const express = require('express');
const router = express.Router();
const {
  getAllTopups,
  getTopupById,
  getTopupsByUser,
  getTopupsByStatus,
  createTopup,
  updateTopup,
  approveTopup,
  rejectTopup,
  deleteTopup,
  uploadScreenshot
} = require('../controllers/topupController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, admin, getAllTopups)
  .post(protect, upload.single('screenshot'), createTopup);

router.post('/upload-screenshot', protect, upload.single('screenshot'), uploadScreenshot);

router.route('/:id')
  .get(protect, getTopupById)
  .put(protect, admin, updateTopup)
  .delete(protect, admin, deleteTopup);

router.get('/user', protect, getTopupsByUser);
router.get('/status/:status', protect, admin, getTopupsByStatus);
router.patch('/:id/approve', protect, admin, approveTopup);
router.patch('/:id/reject', protect, admin, rejectTopup);

module.exports = router;
