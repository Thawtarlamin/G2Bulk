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
  orderCallback
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, admin, getAllOrders)
  .post(protect, createOrder);

// Webhook callback (no auth required for external webhook)
router.post('/callback', orderCallback);

router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, admin, updateOrder)
  .delete(protect, admin, deleteOrder);

router.get('/user/:userId', protect, getOrdersByUser);
router.get('/:id/check-status', protect, checkOrderStatus);
router.patch('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
