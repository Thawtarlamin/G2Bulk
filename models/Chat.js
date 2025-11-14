const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'admin'],
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    user: {
      type: Number,
      default: 0
    },
    admin: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
