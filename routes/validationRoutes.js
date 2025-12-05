const express = require('express');
const router = express.Router();
const { checkPlayerId } = require('../controllers/validationController');

// @route   POST /api/validation/check-player
// @desc    Check player ID validation
// @access  Public (can be used before order)
router.post('/check-player', checkPlayerId);

module.exports = router;
