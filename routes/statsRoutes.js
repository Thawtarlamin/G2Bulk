const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getMonthlyStats,
  getYearlyStats,
  getTopProducts,
  getRecentActivities
} = require('../controllers/statsController');
const { protect, admin } = require('../middleware/auth');

// All stats routes require admin access
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/monthly', getMonthlyStats);
router.get('/yearly', getYearlyStats);
router.get('/top-products', getTopProducts);
router.get('/recent-activities', getRecentActivities);

module.exports = router;
