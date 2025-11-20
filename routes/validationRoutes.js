const express = require('express');
const router = express.Router();
const { checkPlayerId, getSupportedGames } = require('../controllers/validationController');
const { protect } = require('../middleware/auth');

// @route   POST /api/validation/check-player
// @desc    Check player ID validation
// @access  Public (can be used before order)
router.post('/check-player', checkPlayerId);

// @route   GET /api/validation/games
// @desc    Get list of supported games for validation
// @access  Public
router.get('/games', getSupportedGames);

module.exports = router;
