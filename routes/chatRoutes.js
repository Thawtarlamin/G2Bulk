const express = require('express');
const router = express.Router();
const {
  getMyChat,
  sendMessage,
  markAsRead,
  getAllChats,
  getChatById,
  closeChat,
  reopenChat,
  deleteChat
} = require('../controllers/chatController');
const { protect, admin } = require('../middleware/auth');

// User routes
router.get('/my-chat', protect, getMyChat);

// Shared routes (User can access their own chat, Admin can access any)
router.post('/:id/message', protect, sendMessage);
router.patch('/:id/read', protect, markAsRead);

// Admin only routes
router.get('/all', protect, admin, getAllChats);
router.get('/:id', protect, admin, getChatById);
router.patch('/:id/close', protect, admin, closeChat);
router.patch('/:id/reopen', protect, admin, reopenChat);
router.delete('/:id', protect, admin, deleteChat);

module.exports = router;
