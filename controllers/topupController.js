const Topup = require('../models/Topup');
const User = require('../models/User');

// @desc    Get all topups
// @route   GET /api/topups
exports.getAllTopups = async (req, res) => {
  try {
    const topups = await Topup.find().populate('user', 'name email');
    res.json(topups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single topup
// @route   GET /api/topups/:id
exports.getTopupById = async (req, res) => {
  try {
    const topup = await Topup.findById(req.params.id).populate('user', 'name email');
    if (!topup) {
      return res.status(404).json({ message: 'Topup not found' });
    }
    res.json(topup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get topups by user
// @route   GET /api/topups/user/:userId
exports.getTopupsByUser = async (req, res) => {
  try {
    const topups = await Topup.find({ user: req.params.userId }).populate('user', 'name email');
    res.json(topups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get topups by status
// @route   GET /api/topups/status/:status
exports.getTopupsByStatus = async (req, res) => {
  try {
    const topups = await Topup.find({ status: req.params.status }).populate('user', 'name email');
    res.json(topups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload screenshot only
// @route   POST /api/topups/upload-screenshot
exports.uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/screenshots/${req.file.filename}`;
    res.status(200).json({ 
      message: 'Screenshot uploaded successfully',
      url: fileUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create new topup
// @route   POST /api/topups
exports.createTopup = async (req, res) => {
  try {
    const { amount, payment_method, transaction_id, last_six_digit } = req.body;

    // Get screenshot URL from uploaded file
    let screenshot_url = req.body.screenshot_url;
    if (req.file) {
      screenshot_url = `/uploads/screenshots/${req.file.filename}`;
    }

    // Validate required fields
    if (!amount || !payment_method || !transaction_id || !screenshot_url || !last_six_digit) {
      return res.status(400).json({ 
        message: 'All fields are required: amount, payment_method, transaction_id, screenshot (file or URL), last_six_digit' 
      });
    }

    // // Validate payment method
    // if (!['kpay', 'wavepay'].includes(payment_method)) {
    //   return res.status(400).json({ message: 'Payment method must be kpay or wavepay' });
    // }

    // Validate amount
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    // Validate last_six_digit
    const parsedLastSixDigit = parseInt(last_six_digit);
    if (isNaN(parsedLastSixDigit)) {
      return res.status(400).json({ message: 'Last six digit must be a number' });
    }

    const topup = await Topup.create({
      user: req.user._id,
      method: payment_method,
      amount: parsedAmount,
      transaction_id,
      screenshot_url,
      last_six_digit: parsedLastSixDigit
    });

    const populatedTopup = await Topup.findById(topup._id).populate('user', 'name email');
    res.status(201).json(populatedTopup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update topup
// @route   PUT /api/topups/:id
exports.updateTopup = async (req, res) => {
  try {
    const topup = await Topup.findById(req.params.id);
    
    if (!topup) {
      return res.status(404).json({ message: 'Topup not found' });
    }

    const updatedTopup = await Topup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json(updatedTopup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve topup
// @route   PATCH /api/topups/:id/approve
exports.approveTopup = async (req, res) => {
  try {
    const { admin_note } = req.body;
    const topup = await Topup.findById(req.params.id);
    
    if (!topup) {
      return res.status(404).json({ message: 'Topup not found' });
    }

    if (topup.status !== 'pending') {
      return res.status(400).json({ message: 'Topup already processed' });
    }

    // Update user balance
    const user = await User.findById(topup.user);
    user.balance += topup.amount;
    await user.save();

    // Update topup status
    topup.status = 'approved';
    if (admin_note) {
      topup.admin_note = admin_note;
    }
    await topup.save();

    const updatedTopup = await Topup.findById(topup._id).populate('user', 'name email balance');
    res.json(updatedTopup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reject topup
// @route   PATCH /api/topups/:id/reject
exports.rejectTopup = async (req, res) => {
  try {
    const { admin_note } = req.body;
    const topup = await Topup.findById(req.params.id);
    
    if (!topup) {
      return res.status(404).json({ message: 'Topup not found' });
    }

    if (topup.status !== 'pending') {
      return res.status(400).json({ message: 'Topup already processed' });
    }

    topup.status = 'rejected';
    if (admin_note) {
      topup.admin_note = admin_note;
    }
    await topup.save();

    const updatedTopup = await Topup.findById(topup._id).populate('user', 'name email');
    res.json(updatedTopup);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete topup
// @route   DELETE /api/topups/:id
exports.deleteTopup = async (req, res) => {
  try {
    const topup = await Topup.findById(req.params.id);
    
    if (!topup) {
      return res.status(404).json({ message: 'Topup not found' });
    }

    await Topup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Topup deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
