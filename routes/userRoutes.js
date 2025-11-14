const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateBalance,
  updateUserRole,
  resetUserPassword,
  banUser,
  unbanUser
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, admin, getAllUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser);

router.patch('/:id/balance', protect, admin, updateBalance);
router.patch('/:id/role', protect, admin, updateUserRole);
router.patch('/:id/reset-password', protect, admin, resetUserPassword);
router.patch('/:id/ban', protect, admin, banUser);
router.patch('/:id/unban', protect, admin, unbanUser);

module.exports = router;
