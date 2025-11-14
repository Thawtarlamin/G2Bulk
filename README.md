# 🎮 SL Gaming Shop - Backend API

A comprehensive gaming shop backend API built with Node.js, Express, MongoDB, and Socket.io. Features real-time chat, automated order processing, balance management, and integration with 24payseller payment gateway.

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

### 💰 Order Management
- Automatic order submission to 24payseller API
- Real-time order status tracking
- Webhook integration for status updates
- Automatic balance deduction from user wallet
- Refund mechanism on order failure
- Order history with pagination

### 💳 Balance & Topup System
- User wallet balance management
- Topup request with screenshot upload
- Admin approval/rejection workflow
- Multiple payment methods (KPay, WavePay)
- Transaction tracking with last 6 digits

### 🛍️ Product Management
- Auto-sync with 24payseller product catalog
- Currency conversion (THB to MMK) with markup
- Daily scheduled sync at 3 AM (Myanmar timezone)
- Configurable exchange rate and markup
- Support for major games (Mobile Legends, PUBG, Free Fire, etc.)

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

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/sl-gaming-shop.git
cd sl-gaming-shop
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables**
```env
MONGODB_URI=mongodb://localhost:27017/sl-gaming-shop
PORT=3000
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRE=30d
PAYSELLER_API_KEY=your_24payseller_api_key
WEBHOOK_URL=http://localhost:3000/api/orders/callback
```

5. **Start the server**
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
