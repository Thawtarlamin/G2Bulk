const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  game: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    name: String,
    sku: String,
    price_mmk: Number, // Myanmar Kyat with 10% markup
    original_price_thb: Number // Original Thai Baht price
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);