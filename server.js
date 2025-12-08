require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const axios = require('axios');
const connectDB = require('./config/database');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174', 'http://localhost:3000', 'http://localhost:3001','https://sl-game-shop-admin.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON format in request body' });
  }
  next(err);
});

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'G2Bulk Gaming Shop API' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment-accounts', require('./routes/paymentAccountRoutes'));
app.use('/api/topups', require('./routes/topupRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/app-config', require('./routes/appConfigRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/validation', require('./routes/validationRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Deep linking route (public, no /api prefix)
app.use('/', require('./routes/deepLinkRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/validation', require('./routes/validationRoutes'));

// Socket.io Authentication Middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.isBanned) {
      return next(new Error('Account banned'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io Connection Handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

  // Join user's personal room
  socket.join(`user_${socket.user._id}`);

  // Join admin room if admin
  if (socket.user.role === 'admin') {
    socket.join('admin_room');
  }

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId } = data;
    if (socket.user.role === 'admin') {
      socket.to(`chat_${chatId}`).emit('typing', {
        sender: 'admin',
        senderName: socket.user.name
      });
    } else {
      socket.to('admin_room').emit('typing', {
        chatId,
        sender: 'user',
        senderName: socket.user.name
      });
    }
  });

  // Handle stop typing
  socket.on('stop_typing', (data) => {
    const { chatId } = data;
    if (socket.user.role === 'admin') {
      socket.to(`chat_${chatId}`).emit('stop_typing');
    } else {
      socket.to('admin_room').emit('stop_typing', { chatId });
    }
  });

  // Handle join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`${socket.user.name} joined chat ${chatId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.name}`);
  });
});

// Cron job: Check pending/processing/confirming orders every second
cron.schedule('* * * * * *', async () => {
  try {
    const Order = require('./models/Order');
    const { getOrderStatus } = require('./utils/g2bulk');

    // Find only pending orders
    const pendingOrders = await Order.find({ 
      status: { $in: ['pending', 'processing', 'confirming'] }
    });
    
    if (pendingOrders.length === 0) {
      return;
    }

    console.log(`Checking ${pendingOrders.length} pending orders...`);

    for (const order of pendingOrders) {
      try {
        if (!order.external_id || !order.product_code) {
          console.log(`Order ${order._id} missing external_id or product_code, skipping`);
          continue;
        }
        console.log(`Checking order ${order._id} with external ID ${order.external_id}`);
        // Check status from G2Bulk
        const statusResponse = await getOrderStatus({
          order_id: parseInt(order.external_id),
          game: order.product_code
        });
        const externalStatus = statusResponse.order.status ? statusResponse.order.status.toLowerCase() : null;

        // Update if status changed
        if (externalStatus && order.status !== externalStatus) {
          const oldStatus = order.status;
          order.status = externalStatus;
          
          // If order is refunded, return money to user
          if (externalStatus === 'refunded' && order.amount && order.user) {
            const UserModel = require('./models/User');
            const user = await UserModel.findById(order.user);
            
            if (user) {
              user.balance += order.amount;
              await user.save();
              console.log(`💰 Refunded ${order.amount} MMK to user ${user.email} (Order ${order._id})`);
            }
          }
          
          await order.save();
          
          console.log(`✓ Order ${order._id} updated: ${oldStatus} -> ${externalStatus}`);
          
          // Emit socket event for real-time update
          io.to(`user_${order.user}`).emit('orderStatusUpdate', {
            orderId: order._id,
            status: externalStatus,
            external_id: order.external_id,
            refunded: externalStatus === 'refunded' ? order.amount : null
          });

          // Notify admin room
          io.to('admin_room').emit('orderStatusUpdate', {
            orderId: order._id,
            userId: order.user,
            status: externalStatus,
            external_id: order.external_id,
            refunded: externalStatus === 'refunded' ? order.amount : null
          });
        }
      } catch (error) {
        console.error(`Failed to check order ${order._id}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Order status check cron failed:', error.message);
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io enabled for real-time chat`);
});