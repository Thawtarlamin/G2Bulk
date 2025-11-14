const PaymentAccount = require('../models/PaymentAccount');

// @desc    Get all payment accounts
// @route   GET /api/payment-accounts
exports.getAllPaymentAccounts = async (req, res) => {
  try {
    const accounts = await PaymentAccount.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment accounts by method
// @route   GET /api/payment-accounts/method/:method
exports.getPaymentAccountsByMethod = async (req, res) => {
  try {
    const accounts = await PaymentAccount.find({ method: req.params.method });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single payment account
// @route   GET /api/payment-accounts/:id
exports.getPaymentAccountById = async (req, res) => {
  try {
    const account = await PaymentAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: 'Payment account not found' });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new payment account
// @route   POST /api/payment-accounts
exports.createPaymentAccount = async (req, res) => {
  try {
    const { method, account_name, image, account_number, admin_note } = req.body;

    const paymentAccount = await PaymentAccount.create({
      method,
      account_name,
      image,
      account_number,
      admin_note
    });

    res.status(201).json(paymentAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update payment account
// @route   PUT /api/payment-accounts/:id
exports.updatePaymentAccount = async (req, res) => {
  try {
    const account = await PaymentAccount.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ message: 'Payment account not found' });
    }

    const updatedAccount = await PaymentAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete payment account
// @route   DELETE /api/payment-accounts/:id
exports.deletePaymentAccount = async (req, res) => {
  try {
    const account = await PaymentAccount.findById(req.params.id);
    
    if (!account) {
      return res.status(404).json({ message: 'Payment account not found' });
    }

    await PaymentAccount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
