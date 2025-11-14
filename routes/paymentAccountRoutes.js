const express = require('express');
const router = express.Router();
const {
  getAllPaymentAccounts,
  getPaymentAccountsByMethod,
  getPaymentAccountById,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount
} = require('../controllers/paymentAccountController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(protect, getAllPaymentAccounts)
  .post(protect, admin, createPaymentAccount);

router.route('/:id')
  .get(protect, getPaymentAccountById)
  .put(protect, admin, updatePaymentAccount)
  .delete(protect, admin, deletePaymentAccount);

router.get('/method/:method', protect, getPaymentAccountsByMethod);

module.exports = router;
