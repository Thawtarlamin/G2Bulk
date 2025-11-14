const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_key: {
    type: String,
    required: true
  },
  item_sku: {
    type: String,
    required: true
  },
  input: {
    type: Object
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'refund'],
    default: 'pending'
  },
  external_id: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
