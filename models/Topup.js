const mongoose = require('mongoose');

const topupSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  method: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  screenshot_url: {
    type: String,
    required: true
  },
  admin_note: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Topup', topupSchema);
