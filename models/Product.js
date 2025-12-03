const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  game: {
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image_url: {
      type: String,
      required: true
    }
  },

  catalogues: [{
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  }],
  tag:{
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
