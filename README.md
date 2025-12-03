# 🎮 SL Gaming Shop - Backend API

A comprehensive gaming shop backend API built with Node.js, Express, MongoDB, and Socket.io. Features real-time chat, automated order processing via G2Bulk API, balance management, and player ID validation.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Role-based access control (User/Admin)
- 30-day token expiration
- User ban system with reason tracking
- Password change functionality
- G2Bulk account info endpoint for admins

### 💰 Order Management
- Automatic order submission to G2Bulk API
- Player ID validation before order placement
- Real-time order status tracking via webhooks
- Automatic balance deduction from user wallet
- Refund mechanism on order failure
- Order history with pagination
- Support for multiple game catalogues

### 💳 Balance & Topup System
- User wallet balance management
- Topup request with screenshot upload
- Admin approval/rejection workflow
- Multiple payment methods support
- Transaction tracking and history

### 🛍️ Product Management
- Manual product creation with game catalogues
- Dynamic pricing with Myanmar Kyat (MMK)
- Support for multiple catalogues per game
- Product tagging system (popular, general, etc.)
- Active/Inactive status management
- Game-based product organization

### 💬 Live Chat System
- Real-time chat between users and admin
- Socket.io WebSocket integration
- Typing indicators
- Unread message counters
- Chat status management (active/closed)

### 📊 Analytics & Statistics
- Dashboard overview with key metrics
- Monthly revenue and profit reports
- Yearly breakdown by month
- Top-selling products analysis
- Recent activities with pagination

### ⚙️ System Configuration
- Dynamic exchange rate management
- Configurable markup rate
- Admin-controlled settings
- Database-driven configuration

### ✅ Player Validation
- Pre-order player ID verification
- Real-time validation via G2Bulk API
- Support for games with server IDs
- Error handling and feedback

### 📤 File Upload
- Multer integration for image uploads
- Screenshot storage for topup verification
- File validation (type, size)
- Static file serving

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- G2Bulk API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Thawtarlamin/sl-game-shop-backend.git
cd sl-game-shop-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/sl-gaming-shop
PORT=3000
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=30d
PAYSELLER_API_KEY=your_g2bulk_api_key_here
PAYSELLER_BASE_URL=https://api.g2bulk.com/v1/
G2BULK_CALLBACK_URL=https://your-domain.com/api/orders/webhook
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:3000`

---

## 📁 Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication & G2Bulk account
│   ├── userController.js    # User management
│   ├── orderController.js   # G2Bulk order processing
│   ├── topupController.js   # Topup handling
│   ├── productController.js # Manual product CRUD
│   ├── chatController.js    # Chat system
│   ├── statsController.js   # Analytics
│   ├── validationController.js # Player ID validation
│   ├── paymentAccountController.js
│   └── systemConfigController.js
├── middleware/
│   ├── auth.js              # JWT authentication & admin
│   └── upload.js            # File upload config
├── models/
│   ├── User.js              # User schema
│   ├── Order.js             # Order schema (G2Bulk format)
│   ├── Topup.js             # Topup schema
│   ├── Product.js           # Product schema (game + catalogues)
│   ├── Chat.js              # Chat schema
│   ├── PaymentAccount.js   # Payment methods
│   └── SystemConfig.js      # System settings
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── orderRoutes.js
│   ├── topupRoutes.js
│   ├── productRoutes.js
│   ├── chatRoutes.js
│   ├── statsRoutes.js
│   ├── validationRoutes.js
│   ├── paymentAccountRoutes.js
│   └── systemConfigRoutes.js
├── utils/
│   └── g2bulk.js            # G2Bulk API helper functions
├── uploads/
│   └── screenshots/         # Uploaded images
├── server.js                # Main entry point
├── package.json
├── .env
└── README.md
```

---

## 🔌 API Endpoints

### 🔓 Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | Get all active products |
| GET | `/api/products/key/:key` | Get product by game code |
| GET | `/api/payment-accounts` | Get payment accounts |
| POST | `/api/validation/check-player` | Validate player ID |
| GET | `/api/validation/games` | Get supported games |

### 👤 User Routes (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/password` | Update password |
| POST | `/api/orders` | Create order (with validation) |
| GET | `/api/orders/:id` | Get order details |
| GET | `/api/orders/:id/check-status` | Check G2Bulk order status |
| POST | `/api/topups` | Create topup request |
| GET | `/api/chat/my-chat` | Get/create user chat |
| POST | `/api/chat/:id/message` | Send message |

### 🔐 Admin Routes (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/g2bulk-me` | Get G2Bulk account info |
| GET | `/api/users` | Get all users |
| PATCH | `/api/users/:id/ban` | Ban user |
| PATCH | `/api/users/:id/role` | Change user role |
| GET | `/api/orders` | Get all orders |
| PATCH | `/api/topups/:id/approve` | Approve topup |
| PATCH | `/api/topups/:id/reject` | Reject topup |
| POST | `/api/products` | Create product manually |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/stats/dashboard` | Get statistics |
| GET | `/api/stats/monthly` | Get monthly stats |
| GET | `/api/stats/yearly` | Get yearly breakdown |
| GET | `/api/stats/top-products` | Get top products |
| GET | `/api/chat/all` | Get all chats |
| POST | `/api/system-config/init` | Initialize configs |

---

## 🎯 Key Technologies

| Technology | Purpose |
|------------|---------|
| **Express 5.1.0** | Web framework |
| **MongoDB + Mongoose 8.19.3** | Database & ODM |
| **Socket.io 4.8.1** | Real-time WebSocket |
| **JWT + Bcrypt** | Authentication & encryption |
| **Multer** | File upload handling |
| **Node-cron** | Scheduled order status checks |
| **Axios 1.13.2** | HTTP client for G2Bulk API |
| **CORS** | Cross-origin resource sharing |

---

## 💡 Core Features Explained

### 1. G2Bulk Integration

Centralized API client in `utils/g2bulk.js`:

```javascript
// Available helper functions:
- getMe()              // Get account info
- checkPlayerId()      // Validate player ID
- placeOrder()         // Create game order
- getOrderStatus()     // Check order status
- listOrders()         // Get order history
- purchaseProduct()    // Purchase voucher products
```

**Order Creation Flow:**
1. Validate player ID via `/api/validation/check-player`
2. User creates order via `/api/orders`
3. System validates balance
4. Deducts amount from user wallet
5. Submits to G2Bulk API
6. Returns order confirmation
7. **If failed**: Auto-refunds balance

```javascript
// Example order creation
POST /api/orders
{
  "product_code": "pubgm",
  "catalogue_name": "60 UC",
  "player_id": "5679523421",
  "server_id": "2001",
  "remark": "Optional note"
}
```

### 2. Player ID Validation

Pre-validate player IDs before order creation:

```javascript
POST /api/validation/check-player
{
  "game": "mlbb",
  "user_id": "123456789",
  "server_id": "2001"
}

// Response
{
  "valid": "valid",
  "name": "John Doe",
  "openid": "41581795132966184"
}
```

### 3. Manual Product Management

Admins can create products with custom catalogues:

```javascript
POST /api/products
{
  "game": {
    "code": "pubgm",
    "name": "PUBG Mobile",
    "image_url": "https://example.com/pubgm.jpg"
  },
  "catalogues": [
    { "name": "60 UC", "amount": 15000 },
    { "name": "325 UC", "amount": 75000 },
    { "name": "660 UC", "amount": 150000 }
  ],
  "tag": "popular"
}
```

### 4. Automated Order Status Tracking

Cron job runs every minute to check pending orders:

```javascript
// Automatically updates order status from G2Bulk
// States: PENDING → PROCESSING → COMPLETED/FAILED
// Emits real-time updates via Socket.io
```

### 5. Real-time Chat with Socket.io

```javascript
// Client connects with JWT token
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});

// Send message
socket.emit('send_message', {
  chatId: 'chat_id',
  message: 'Hello!'
});

// Receive new messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

// Typing indicators
socket.emit('typing', { chatId: 'chat_id' });
socket.on('typing', (data) => {
  console.log('User is typing...');
});
```

### 6. Balance Management

Users can top up balance via:
1. Submit topup request with payment screenshot
2. Specify payment method and amount
3. Admin reviews and approves/rejects
4. On approval: Balance automatically added
5. Transaction history tracked

### 7. Statistics & Analytics

```javascript
GET /api/stats/dashboard
// Returns:
{
  "users": { "total": 150 },
  "orders": { "total": 500, "success": 480, "pending": 20 },
  "revenue": { "total": 5000000, "profit": 1000000 }
}

GET /api/stats/monthly?year=2025&month=11
// Returns monthly breakdown with profit calculation

GET /api/stats/top-products?limit=10
// Returns best-selling products by revenue
```

---

## 🎮 Supported Games

G2Bulk API supports 100+ games. Popular games include:

- **Mobile Legends: Bang Bang** (All regions)
- **PUBG Mobile** (Global & regions)
- **Free Fire** (All regions)
- **Honor of Kings** (Global)
- **Genshin Impact**
- **Call of Duty Mobile**
- **Arena of Valor**
- And many more...

---

## 🔒 Security Features

- ✅ JWT token authentication with 30-day expiry
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Role-based access control (protect/admin middleware)
- ✅ User ban system with reason tracking
- ✅ Protected routes with JWT verification
- ✅ CORS configuration for multiple origins
- ✅ Environment variable protection
- ✅ Input validation and sanitization
- ✅ API key authentication for G2Bulk
- ✅ Automatic retry logic on timeout errors

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  balance: Number (default: 0),
  role: 'user' | 'admin' (default: 'user'),
  isBanned: Boolean (default: false),
  banReason: String,
  bannedAt: Date
}
```

### Order Model (G2Bulk Format)
```javascript
{
  user: ObjectId (ref: User),
  product_code: String (game code),
  catalogue_name: String (item name),
  player_id: String (required),
  server_id: String,
  remark: String,
  amount: Number (MMK),
  external_id: String (G2Bulk order_id),
  status: 'pending' | 'processing' | 'completed' | 'failed',
  input: Object
}
```

### Product Model
```javascript
{
  game: {
    code: String (unique, e.g., 'pubgm'),
    name: String,
    image_url: String
  },
  catalogues: [{
    id: Number,
    name: String (e.g., '60 UC'),
    amount: Number (price in MMK)
  }],
  tag: String (default: 'general'),
  status: 'active' | 'inactive'
}
```

### Topup Model
```javascript
{
  user: ObjectId (ref: User),
  method: String (payment method name),
  amount: Number,
  screenshot_url: String (required),
  status: 'pending' | 'approved' | 'rejected',
  admin_note: String
}
```

---

## 🛠️ Configuration

### System Config API

Admins can configure system settings dynamically:

```javascript
// Initialize default configs
POST /api/system-config/init

// Update exchange rate
PUT /api/system-config/exchange_rate
{
  "value": 130.50
}

// Update markup rate
PUT /api/system-config/markup_rate
{
  "value": 1.15  // 15% markup
}
```

---

## 🔄 Webhook Integration

G2Bulk automatically calls your webhook when order status changes:

```javascript
POST https://your-domain.com/api/orders/webhook
{
  "order_id": 42,
  "game_code": "pubgm",
  "player_id": "5679523421",
  "status": "COMPLETED",
  "message": "Order completed successfully"
}
```

**Setup:**
1. Set `G2BULK_CALLBACK_URL` in `.env`
2. Ensure your domain is publicly accessible
3. G2Bulk will POST to this URL on status changes

---

## 📱 Frontend Integration

### React Admin Dashboard

**Recommended Tech Stack:**
- React + Vite
- Tailwind CSS
- Axios for API calls
- React Router v6
- Recharts for analytics
- Socket.io Client for real-time features

### Flutter Mobile App

**Key Features to Implement:**
- User authentication (JWT storage)
- Product browsing with search
- Player ID validation before checkout
- Balance display and topup
- Order history with status tracking
- Real-time chat with admin

---

## 🚦 Order Status Flow

```
User Creates Order
       ↓
Balance Validated & Deducted
       ↓
G2Bulk API Called
       ↓
Order Saved (PENDING)
       ↓
Cron Job Checks Status Every Minute
       ↓
G2Bulk Returns: PROCESSING → COMPLETED/FAILED
       ↓
Database Updated
       ↓
Socket.io Emits Update
       ↓
User Notified
```

---

## 🧪 Testing

### Test G2Bulk Connection

```bash
# Get account info (requires admin token)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3000/api/auth/g2bulk-me
```

### Test Player Validation

```bash
curl -X POST http://localhost:3000/api/validation/check-player \
     -H "Content-Type: application/json" \
     -d '{"game":"mlbb","user_id":"123456789","server_id":"2001"}'
```

### Test Order Creation

```bash
curl -X POST http://localhost:3000/api/orders \
     -H "Authorization: Bearer YOUR_USER_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "product_code":"pubgm",
       "catalogue_name":"60 UC",
       "player_id":"5679523421",
       "server_id":"2001"
     }'
```

---

## 🐛 Troubleshooting

### Common Issues

**1. G2Bulk API Connection Failed**
- Check `PAYSELLER_API_KEY` in `.env`
- Verify `PAYSELLER_BASE_URL` is correct
- Test with `/api/auth/g2bulk-me` endpoint

**2. Orders Stay in PENDING**
- Check cron job is running in `server.js`
- Verify G2Bulk API key has proper permissions
- Check server logs for error messages

**3. Player Validation Fails**
- Ensure game code matches G2Bulk format
- Verify server_id is provided when required
- Check player ID format (numbers only)

**4. Socket.io Not Connecting**
- Verify JWT token is valid and not expired
- Check CORS settings in `server.js`
- Ensure client uses correct Socket.io version

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For support:
- Email: support@slgamingshop.com
- GitHub Issues: [Create an issue](https://github.com/Thawtarlamin/sl-game-shop-backend/issues)

---

## 🙏 Acknowledgments

- G2Bulk for gaming product API integration
- Socket.io team for real-time capabilities
- MongoDB team for excellent database
- Express.js community

---

**⭐ If you find this project useful, please give it a star!**

---

Made with ❤️ by [Thaw Tar Lamin](https://github.com/Thawtarlamin)

---

## 📁 Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── orderController.js   # Order processing
│   ├── topupController.js   # Topup handling
│   ├── productController.js # Product sync
│   ├── chatController.js    # Chat system
│   ├── statsController.js   # Analytics
│   └── systemConfigController.js
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── upload.js            # File upload config
├── models/
│   ├── User.js              # User schema
│   ├── Order.js             # Order schema
│   ├── Topup.js             # Topup schema
│   ├── Product.js           # Product schema
│   ├── Chat.js              # Chat schema
│   ├── PaymentAccount.js   # Payment methods
│   └── SystemConfig.js      # System settings
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── orderRoutes.js
│   ├── topupRoutes.js
│   ├── productRoutes.js
│   ├── chatRoutes.js
│   ├── statsRoutes.js
│   └── systemConfigRoutes.js
├── uploads/
│   └── screenshots/         # Uploaded images
├── server.js                # Main entry point
├── package.json
└── .env
```

---

## 🔌 API Endpoints

### 🔓 Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/products` | Get all products |
| GET | `/api/payment-accounts` | Get payment accounts |

### 👤 User Routes (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/password` | Update password |
| POST | `/api/orders` | Create order (auto-deduct balance) |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/topups` | Create topup request |
| GET | `/api/chat/my-chat` | Get/create user chat |
| POST | `/api/chat/:id/message` | Send message |

### 🔐 Admin Routes (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| PATCH | `/api/users/:id/ban` | Ban user |
| PATCH | `/api/users/:id/role` | Change user role |
| GET | `/api/orders` | Get all orders |
| PATCH | `/api/topups/:id/approve` | Approve topup |
| POST | `/api/products/sync` | Sync products |
| GET | `/api/stats/dashboard` | Get statistics |
| GET | `/api/chat/all` | Get all chats |
| POST | `/api/system-config/init` | Initialize configs |

📚 **Full API Documentation:** [API_ROUTES.md](./API_ROUTES.md)

---

## 🎯 Key Technologies

| Technology | Purpose |
|------------|---------|
| **Express 5.1.0** | Web framework |
| **MongoDB + Mongoose 8.19.3** | Database & ODM |
| **Socket.io 4.8.1** | Real-time WebSocket |
| **JWT + Bcrypt** | Authentication & encryption |
| **Multer** | File upload handling |
| **Node-cron** | Scheduled tasks |
| **Axios 1.13.2** | HTTP client for external APIs |
| **CORS** | Cross-origin resource sharing |

---

## 💡 Core Features Explained

### 1. Automatic Order Processing

When a user creates an order:
1. System validates user balance
2. Deducts order amount from user wallet
3. Submits order to 24payseller API
4. Saves external transaction ID
5. Returns order confirmation
6. **If API fails**: Automatically refunds balance

```javascript
// Example order creation
POST /api/orders
{
  "product_key": "mobile-legends-global",
  "item_sku": "60diamonds",
  "input": {
    "uid": "123456789",
    "server": "Asia"
  }
}
```

### 2. Product Sync Automation

- Runs daily at 3:00 AM (Myanmar timezone)
- Fetches products from 24payseller API
- Converts THB to MMK with configurable exchange rate
- Applies markup (default 10%)
- Updates database automatically

```javascript
// Exchange rate and markup stored in database
exchange_rate: 125.79  // 1 THB = 125.79 MMK
markup_rate: 1.10      // 10% profit margin
```

### 3. Real-time Chat with Socket.io

```javascript
// Client connects with JWT token
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});

// Send message
socket.emit('send_message', {
  chatId: 'chat_id',
  message: 'Hello!'
});

// Receive new messages
socket.on('new_message', (data) => {
  console.log('New message:', data);
});

// Typing indicators
socket.emit('typing', { chatId: 'chat_id' });
socket.on('typing', (data) => {
  console.log('User is typing...');
});
```

### 4. Balance Management

Users can top up balance via:
1. Submit topup request with payment screenshot
2. Admin reviews and approves/rejects
3. On approval: Balance automatically added to user account
4. Transaction history tracked

### 5. Statistics & Analytics

```javascript
GET /api/stats/dashboard
// Returns:
{
  "users": { "total": 150 },
  "orders": { "total": 500, "success": 480, "pending": 20 },
  "revenue": { "total": 5000000, "profit": 1000000 }
}

GET /api/stats/monthly?year=2025&month=11
// Returns monthly breakdown with profit calculation
```

---

## 🎮 Supported Games

- **Mobile Legends: Bang Bang** (Global, Indonesia, Malaysia, Singapore)
- **Honor of Kings Global**
- **Magic Chess: Go Go**
- **PUBG Mobile Global**
- **Free Fire** (Indonesia, Vietnam, Singapore, Malaysia)

---

## 🔒 Security Features

- ✅ JWT token authentication with 30-day expiry
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ User ban system
- ✅ Protected routes with middleware
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Input validation

---

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  balance: Number,
  role: 'user' | 'admin',
  isBanned: Boolean,
  banReason: String,
  bannedAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId,
  product_key: String,
  item_sku: String,
  amount: Number,
  input: Object,
  external_id: String,
  status: 'pending' | 'processing' | 'success' | 'failed',
  payseller_response: Object
}
```

### Topup Model
```javascript
{
  user: ObjectId,
  method: 'kpay' | 'wavepay',
  amount: Number,
  screenshot_url: String,
  transaction_id: String,
  last_six_digit: Number,
  status: 'pending' | 'approved' | 'rejected',
  admin_note: String
}
```

---

## 🛠️ Configuration

### System Config API

Admins can configure system settings dynamically:

```javascript
// Initialize default configs
POST /api/system-config/init

// Update exchange rate
PUT /api/system-config/exchange_rate
{
  "value": 130.50
}

// Update markup rate
PUT /api/system-config/markup_rate
{
  "value": 1.15  // 15% markup
}
```

---

## 📱 Frontend Integration

### React Admin Dashboard

Full admin dashboard documentation: [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md)

**Tech Stack:**
- React + Vite
- Tailwind CSS
- Axios
- React Router
- Recharts (for analytics)
- Socket.io Client

### Flutter Mobile App

Mobile app API documentation: [FLUTTER_API.md](./FLUTTER_API.md)

---

## 🔄 Webhook Integration

24payseller automatically calls your webhook when order status changes:

```javascript
POST http://your-domain.com/api/orders/callback
{
  "transactionId": "pay_12345",
  "status": "success",
  "message": "Order completed"
}
```

**In production:** Update `WEBHOOK_URL` in `.env` to your public domain.

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

For support, email support@slgamingshop.com or join our Discord server.

---

## 🙏 Acknowledgments

- 24payseller for payment gateway integration
- Socket.io team for real-time capabilities
- MongoDB team for excellent database

---

**⭐ If you find this project useful, please give it a star!**

---

Made with ❤️ by SL Gaming Shop Team

## Documentation

- [API Routes](./API_ROUTES.md) - Complete REST API documentation
- [Socket.io Chat](./SOCKET_CHAT.md) - Real-time chat WebSocket documentation

## API Overview

**52 REST Endpoints:**
- Authentication (3 endpoints)
- User Management (11 endpoints)
- Orders (6 endpoints)
- Payment Accounts (6 endpoints)
- Topups (8 endpoints)
- Products (6 endpoints)
- Live Chat (8 endpoints)
- Webhook (1 endpoint)

**Real-time Features:**
- Instant message notifications
- Typing indicators
- Unread count updates
- Admin/User chat rooms

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User CRUD & management
│   ├── orderController.js   # Order & 24payseller integration
│   ├── paymentAccountController.js
│   ├── topupController.js   # Topup approval system
│   ├── productController.js # Product sync
│   └── chatController.js    # Chat with Socket.io
├── middleware/
│   └── auth.js              # JWT & role middleware
├── models/
│   ├── User.js
│   ├── Order.js
│   ├── PaymentAccount.js
│   ├── Topup.js
│   ├── Product.js
│   └── Chat.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── orderRoutes.js
│   ├── paymentAccountRoutes.js
│   ├── topupRoutes.js
│   ├── productRoutes.js
│   └── chatRoutes.js
├── .env
├── server.js                # Main entry point
└── package.json
```

## License

ISC
