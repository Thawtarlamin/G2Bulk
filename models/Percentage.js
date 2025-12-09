const mongoose = require('mongoose');

const percentageSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 10
  },
  description: {
    type: String,
    default: 'Product markup percentage'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Percentage', percentageSchema);
