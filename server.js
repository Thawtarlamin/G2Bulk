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

// Auto sync products every day at 3 AM
cron.schedule('0 3 * * *', async () => {
  try {
    console.log('Running daily product sync...');
    const Product = require('./models/Product');
    
    const response = await axios.get('https://x.24payseller.com/products/list');
    const exchangeRate = 125.79;
    const markupRate = 1.10;
    
    const targetGames = [
      'mobile-legends-global',
      'honor-of-kings-global',
      'magicchess-go-go',
      'pubg-mobile-global',
      'free-fire-v1'
    ];
    
    const productsData = response.data;
    let syncedCount = 0;
    
    for (const productData of productsData) {
      if (targetGames.includes(productData.key)) {
        const items = productData.items.map(item => ({
          name: item.name,
          sku: item.sku,
          original_price_thb: parseFloat(item.price),
          price_mmk: Math.round(parseFloat(item.price) * exchangeRate * markupRate)
        }));

        let inputs = [];
        if (productData.inputs) {
          if (Array.isArray(productData.inputs)) {
            inputs = productData.inputs;
          } else if (typeof productData.inputs === 'string') {
            try {
              inputs = JSON.parse(productData.inputs);
            } catch (e) {
              inputs = [];
            }
          }
        }

        await Product.findOneAndUpdate(
          { key: productData.key },
          {
            game: productData.name,
            key: productData.key,
            items,
            inputs,
            status: 'active'
          },
          { upsert: true, new: true }
        );
        
        syncedCount++;
      }
    }
    
    console.log(`Daily sync completed: ${syncedCount} products updated`);
  } catch (error) {
    console.error('Daily product sync failed:', error.message);
  }
}, {
  timezone: "Asia/Yangon"
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174', 'http://localhost:3000','https://sl-game-shop-admin.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SL Gaming Shop API' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment-accounts', require('./routes/paymentAccountRoutes'));
app.use('/api/topups', require('./routes/topupRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/system-config', require('./routes/systemConfigRoutes'));

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

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io enabled for real-time chat`);
});