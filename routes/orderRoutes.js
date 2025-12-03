const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  checkOrderStatus,
  handleCallback
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, admin, getAllOrders)
  .post(protect, createOrder);

// G2Bulk callback webhook (no authentication required)
router.post('/callback', handleCallback);

router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, admin, updateOrder)
  .delete(protect, admin, deleteOrder);

router.get('/user/:userId', protect, getOrdersByUser);
router.get('/:id/check-status', protect, checkOrderStatus);
router.patch('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
