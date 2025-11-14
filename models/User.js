const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  bannedAt: {
    type: Date
  },
  banReason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
