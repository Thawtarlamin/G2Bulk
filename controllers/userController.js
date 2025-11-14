const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new user
// @route   POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      balance: user.balance,
      role: user.role
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash password if it's being updated
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user balance
// @route   PATCH /api/users/:id/balance
exports.updateBalance = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.balance += amount;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      balance: user.balance
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: `User role updated to ${role}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Reset user password (Admin)
// @route   PATCH /api/users/:id/reset-password
exports.resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: 'Password reset successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Ban user
// @route   PATCH /api/users/:id/ban
exports.banUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    if (user.isBanned) {
      return res.status(400).json({ message: 'User is already banned' });
    }

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = reason || 'No reason provided';
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isBanned: user.isBanned,
      bannedAt: user.bannedAt,
      banReason: user.banReason,
      message: 'User banned successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Unban user
// @route   PATCH /api/users/:id/unban
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isBanned) {
      return res.status(400).json({ message: 'User is not banned' });
    }

    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = null;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isBanned: user.isBanned,
      message: 'User unbanned successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
