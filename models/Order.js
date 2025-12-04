const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_code:{
    type: String,
    required: true
  },
  catalogue_name: {
    type: String,
    required: true
  },
  remark: {
    type: String
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
    enum: ['pending', 'completed', 'refunded', 'failed', 'processing', 'confirming'],
    default: 'pending'
  },
  external_id: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
