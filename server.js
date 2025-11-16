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
    console.log('Running daily product sync with images...');
    const Product = require('./models/Product');
    const SystemConfig = require('./models/SystemConfig');
    const { assignProductImages } = require('./utils/productImageMapper');
    
    const response = await axios.get('https://x.24payseller.com/products/list');
    
    // Get exchange rate and markup from database
    const exchangeRateConfig = await SystemConfig.findOne({ key: 'exchange_rate' });
    const markupRateConfig = await SystemConfig.findOne({ key: 'markup_rate' });
    
    const exchangeRate = exchangeRateConfig?.value || 125.79;
    const markupRate = markupRateConfig?.value || 1.10;
    
    const targetGames = [
      'mobile-legends-global',
      'mobile-legends-indonesia',
      'mobile-legends-malaysia',
      'mlbb-php-flashsale',
      'mobile-legends-singapore',
      'honor-of-kings-global',
      'magicchess-go-go',
      'pubg-mobile-global',
      'free-fire-i',
      'free-fire-v1',
      'free-fire-sg',
      'free-fire-my'
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

        // Assign images to game and items (will use cached images if already downloaded)
        console.log(`Processing images for ${productData.key}...`);
        const imageResults = await assignProductImages(productData.key, items);

        await Product.findOneAndUpdate(
          { key: productData.key },
          {
            game: productData.name,
            key: productData.key,
            image: imageResults.gameImage,
            items: imageResults.items,
            status: 'active'
          },
          { upsert: true, new: true }
        );
        
        syncedCount++;
        console.log(`✓ Synced ${productData.key} with images`);
      }
    }
    
    console.log(`Daily sync completed: ${syncedCount} products updated with images`);
  } catch (error) {
    console.error('Daily product sync failed:', error.message);
  }
}, {
  timezone: "Asia/Yangon"
});

// Auto check pending orders status every minute
cron.schedule('* * * * *', async () => {
  try {
    const Order = require('./models/Order');
    const PAYSELLER_API_KEY = process.env.PAYSELLER_API_KEY;
    const PAYSELLER_BASE_URL = 'https://x.24payseller.com';

    // Find all pending orders
    const pendingOrders = await Order.find({ status: 'pending' });
    
    if (pendingOrders.length === 0) {
      return;
    }

    console.log(`Checking status for ${pendingOrders.length} pending orders...`);

    for (const order of pendingOrders) {
      try {
        // Check status from 24payseller
        const statusResponse = await axios.get(
          `${PAYSELLER_BASE_URL}/agent/orders/${order.external_id}`,
          {
            headers: {
              'X-Api-Key': PAYSELLER_API_KEY
            }
          }
        );

        const externalOrder = statusResponse.data.order || statusResponse.data;
        const externalStatus = externalOrder.state || externalOrder.status;

        // Update if status changed
        if (externalStatus && order.status !== externalStatus) {
          order.status = externalStatus;
          await order.save();
          console.log(`✓ Order ${order._id} updated: pending -> ${externalStatus}`);
          
          // Emit socket event for real-time update
          io.emit('orderStatusUpdate', {
            orderId: order._id,
            status: externalStatus,
            transactionId: order.external_id
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