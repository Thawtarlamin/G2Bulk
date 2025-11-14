const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get or create chat for current user
// @route   GET /api/chat/my-chat
exports.getMyChat = async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user._id }).populate('user', 'name email');
    
    if (!chat) {
      chat = await Chat.create({
        user: req.user._id,
        messages: []
      });
      chat = await Chat.findById(chat._id).populate('user', 'name email');
    }

    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Send message (User or Admin)
// @route   POST /api/chat/:id/message
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isOwner = chat.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const newMessage = {
      sender: isAdmin ? 'admin' : 'user',
      senderName: req.user.name,
      message: message.trim(),
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    
    // Increment unread count for the receiver
    if (isAdmin) {
      chat.unreadCount.user += 1;
    } else {
      chat.unreadCount.admin += 1;
    }

    await chat.save();
    await chat.populate('user', 'name email');

    // Emit socket event for real-time update
    const io = req.app.get('io');
    const messageData = {
      chatId: chat._id,
      message: newMessage,
      unreadCount: chat.unreadCount
    };

    if (isAdmin) {
      // Admin sent message - notify user
      io.to(`user_${chat.user._id}`).emit('new_message', messageData);
    } else {
      // User sent message - notify all admins
      io.to('admin_room').emit('new_message', messageData);
    }

    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PATCH /api/chat/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = chat.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    // Mark messages as read based on who is reading
    const senderType = isAdmin ? 'user' : 'admin';
    chat.messages.forEach(msg => {
      if (msg.sender === senderType && !msg.isRead) {
        msg.isRead = true;
      }
    });

    // Reset unread count for current user
    if (isAdmin) {
      chat.unreadCount.admin = 0;
    } else {
      chat.unreadCount.user = 0;
    }

    await chat.save();
    await chat.populate('user', 'name email');

    // Emit socket event for read status update
    const io = req.app.get('io');
    const readData = {
      chatId: chat._id,
      unreadCount: chat.unreadCount
    };

    if (isAdmin) {
      io.to(`user_${chat.user._id}`).emit('messages_read', readData);
    } else {
      io.to('admin_room').emit('messages_read', readData);
    }

    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all chats (Admin only)
// @route   GET /api/chat/all
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .populate('user', 'name email')
      .sort('-lastMessageAt');

    res.json(chats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get chat by ID (Admin only)
// @route   GET /api/chat/:id
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('user', 'name email');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Close chat (Admin only)
// @route   PATCH /api/chat/:id/close
exports.closeChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.status = 'closed';
    await chat.save();
    await chat.populate('user', 'name email');

    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reopen chat (Admin only)
// @route   PATCH /api/chat/:id/reopen
exports.reopenChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.status = 'active';
    await chat.save();
    await chat.populate('user', 'name email');

    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete chat (Admin only)
// @route   DELETE /api/chat/:id
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    await chat.deleteOne();
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
