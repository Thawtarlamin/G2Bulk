const mongoose = require('mongoose');

const paymentAccountSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true
  },
  account_name: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  account_number: {
    type: String,
    required: true
  },
  admin_note: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentAccount', paymentAccountSchema);
