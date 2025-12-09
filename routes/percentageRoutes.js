const express = require('express');
const router = express.Router();
const {
  getPercentage,
  updatePercentage
} = require('../controllers/percentageController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getPercentage)
  .put(protect, admin, updatePercentage);

module.exports = router;
