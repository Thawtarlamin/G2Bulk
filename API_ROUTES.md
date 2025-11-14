# SL Gaming Shop API Routes

## Base URL
```
http://localhost:3000/api
```

---

## 📋 Quick Navigation

- [🔓 Public Routes](#-public-routes)
- [👤 User Routes (Protected)](#-user-routes-protected)
- [🔐 Admin Routes (Admin Only)](#-admin-routes-admin-only)
- [📝 Request Examples](#-request-examples)
- [🔧 Environment Variables](#-environment-variables)

---

# 🔓 Public Routes

## Authentication Routes (`/api/auth`)

### Register & Login (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |

## Product Routes (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products (filter by game/status) |
| GET | `/products/:id` | Get product by ID |
| GET | `/products/key/:key` | Get product by key |

---

# 👤 User Routes (Protected)

**Requires:** `Authorization: Bearer <token>`

## Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/password` | Update own password (requires current password) |

## User Profile (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:id` | Get user by ID (own profile) |
| PUT | `/users/:id` | Update user (own profile) |

## Orders (`/api/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create new order (auto submit to 24payseller) |
| GET | `/orders/:id` | Get order by ID (own orders) |
| GET | `/orders/user/:userId` | Get orders by user (own orders) |
| GET | `/orders/:id/check-status` | Check order status from 24payseller |

## Payment Accounts (`/api/payment-accounts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payment-accounts` | Get all payment accounts |
| GET | `/payment-accounts/:id` | Get payment account by ID |
| GET | `/payment-accounts/method/:method` | Get accounts by method (kpay/wavepay) |

## Topups (`/api/topups`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/topups` | Create new topup request |
| GET | `/topups/:id` | Get topup by ID (own topups) |
| GET | `/topups/user/:userId` | Get topups by user (own topups) |

## Products (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |

## Live Chat (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/my-chat` | Get or create chat for current user |
| POST | `/chat/:id/message` | Send message to chat (real-time via socket.io) |
| PATCH | `/chat/:id/read` | Mark messages as read (real-time via socket.io) |

**Note:** Chat uses Socket.io for real-time updates. See [SOCKET_CHAT.md](./SOCKET_CHAT.md) for WebSocket documentation.

---

# 🔐 Admin Routes (Admin Only)

**Requires:** `Authorization: Bearer <admin_token>` + `role: admin`

## User Management (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users |
| POST | `/users` | Create new user |
| DELETE | `/users/:id` | Delete user |
| PATCH | `/users/:id/balance` | Update user balance |
| PATCH | `/users/:id/role` | Change user role (user/admin) |
| PATCH | `/users/:id/reset-password` | Reset user password (admin only) |
| PATCH | `/users/:id/ban` | Ban user account |
| PATCH | `/users/:id/unban` | Unban user account |

## Order Management (`/api/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | Get all orders |
| PUT | `/orders/:id` | Update order |
| DELETE | `/orders/:id` | Delete order |
| PATCH | `/orders/:id/status` | Update order status manually |

## Payment Account Management (`/api/payment-accounts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment-accounts` | Create payment account |
| PUT | `/payment-accounts/:id` | Update payment account |
| DELETE | `/payment-accounts/:id` | Delete payment account |

## Topup Management (`/api/topups`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/topups` | Get all topups |
| PUT | `/topups/:id` | Update topup |
| DELETE | `/topups/:id` | Delete topup |
| GET | `/topups/status/:status` | Get topups by status (pending/approved/rejected) |
| PATCH | `/topups/:id/approve` | Approve topup & add balance to user |
| PATCH | `/topups/:id/reject` | Reject topup |

## Product Management (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create new product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/sync` | Sync products from 24payseller API |

## Chat Management (`/api/chat`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/all` | Get all chats |
| GET | `/chat/:id` | Get chat by ID |
| POST | `/chat/:id/message` | Send message to any chat |
| PATCH | `/chat/:id/read` | Mark chat messages as read |
| PATCH | `/chat/:id/close` | Close chat |
| PATCH | `/chat/:id/reopen` | Reopen closed chat |
| DELETE | `/chat/:id` | Delete chat |

## Statistics (`/api/stats`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/dashboard` | Get overall dashboard statistics |
| GET | `/stats/monthly` | Get monthly revenue/profit (query: year, month) |
| GET | `/stats/yearly` | Get yearly breakdown by month (query: year) |
| GET | `/stats/top-products` | Get top selling products (query: limit) |
| GET | `/stats/recent-activities` | Get recent orders and topups (query: page, limit) |

## System Configuration (`/api/system-config`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/system-config` | Get all system configs |
| GET | `/system-config/:key` | Get config by key |
| POST | `/system-config` | Create or update config |
| POST | `/system-config/init` | Initialize default configs |
| PUT | `/system-config/:key` | Update config value |
| DELETE | `/system-config/:key` | Delete config |

## Webhook (`/api/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders/callback` | Webhook callback from 24payseller (no auth) |

---

## 📝 Request Examples

### Register User
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "123456"
}
```

### Create Order (Auto submit to 24payseller)
```json
POST /api/orders
Authorization: Bearer <token>
{
  "user": "user_id",
  "product_key": "mobile-legends-global",
  "item_sku": "abc123",
  "input": {
    "uid": "123456789",
    "server": "Asia"
  }
}

Response:
{
  "_id": "order_id",
  "user": {...},
  "product_key": "mobile-legends-global",
  "item_sku": "abc123",
  "input": {...},
  "external_id": "pay_transaction_12345",
  "status": "pending",
  "payseller_response": {
    "transactionId": "pay_transaction_12345",
    "status": "pending"
  }
}
```

### Check Order Status
```bash
GET /api/orders/:id/check-status
Authorization: Bearer <token>

Response:
{
  "order": {
    "_id": "order_id",
    "status": "success",
    "external_id": "pay_transaction_12345"
  },
  "external_status": {
    "transactionId": "pay_transaction_12345",
    "status": "success",
    "message": "Order completed successfully"
  }
}
```

### Webhook Callback (24payseller)
```json
POST /api/orders/callback
Content-Type: application/json
{
  "transactionId": "pay_transaction_12345",
  "status": "success",
  "message": "Order completed"
}
```

### Create Topup Request
```json
POST /api/topups
Authorization: Bearer <token>
{
  "user": "user_id",
  "method": "kpay",
  "amount": 10000,
  "last_six_digit": 123456
}
```

### Approve Topup
```json
PATCH /api/topups/:id/approve
Authorization: Bearer <admin_token>
{
  "admin_note": "Approved by admin"
}
```

### Change User Role
```json
PATCH /api/users/:id/role
Authorization: Bearer <admin_token>
{
  "role": "admin"
}

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "message": "User role updated to admin"
}
```

### Update Own Password (User)
```json
PUT /api/auth/password
Authorization: Bearer <token>
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "new_jwt_token"
}
```

### Reset User Password (Admin)
```json
PATCH /api/users/:id/reset-password
Authorization: Bearer <admin_token>
{
  "newPassword": "newpass123"
}

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Password reset successfully"
}
```

### Ban User
```json
PATCH /api/users/:id/ban
Authorization: Bearer <admin_token>
{
  "reason": "Violation of terms"
}

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "isBanned": true,
  "bannedAt": "2025-11-13T10:30:00.000Z",
  "banReason": "Violation of terms",
  "message": "User banned successfully"
}
```

### Unban User
```json
PATCH /api/users/:id/unban
Authorization: Bearer <admin_token>

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "isBanned": false,
  "message": "User unbanned successfully"
}
```

### Update User Balance
```json
PATCH /api/users/:id/balance
Authorization: Bearer <admin_token>
{
  "amount": 10000
}

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "balance": 10000
}
```

### Sync Products
```json
POST /api/products/sync
Authorization: Bearer <admin_token>
```

### Get My Chat (User)
```json
GET /api/chat/my-chat
Authorization: Bearer <token>

Response:
{
  "_id": "chat_id",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "messages": [],
  "status": "active",
  "unreadCount": {
    "user": 0,
    "admin": 0
  },
  "createdAt": "2025-11-13T10:00:00.000Z"
}
```

### Send Message
```json
POST /api/chat/:id/message
Authorization: Bearer <token>
{
  "message": "Hello, I need help"
}

Response:
{
  "_id": "chat_id",
  "messages": [
    {
      "sender": "user",
      "senderName": "John Doe",
      "message": "Hello, I need help",
      "timestamp": "2025-11-13T10:30:00.000Z",
      "isRead": false,
      "_id": "msg_id"
    }
  ],
  "unreadCount": {
    "user": 0,
    "admin": 1
  }
}
```

### Mark Messages as Read
```json
PATCH /api/chat/:id/read
Authorization: Bearer <token>

Response:
{
  "_id": "chat_id",
  "messages": [
    {
      "sender": "admin",
      "senderName": "Admin",
      "message": "How can I help you?",
      "isRead": true,
      "timestamp": "2025-11-13T10:31:00.000Z"
    }
  ],
  "unreadCount": {
    "user": 0,
    "admin": 1
  }
}
```

### Get All Chats (Admin)
```json
GET /api/chat/all
Authorization: Bearer <admin_token>

Response: [
  {
    "_id": "chat_id",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "status": "active",
    "lastMessageAt": "2025-11-13T10:30:00.000Z",
    "unreadCount": {
      "user": 0,
      "admin": 1
    }
  }
]
```

### Close Chat (Admin)
```json
PATCH /api/chat/:id/close
Authorization: Bearer <admin_token>

Response:
{
  "_id": "chat_id",
  "status": "closed",
  "message": "Chat closed successfully"
}
```

### Get Dashboard Statistics
```json
GET /api/stats/dashboard
Authorization: Bearer <admin_token>

Response:
{
  "users": {
    "total": 150
  },
  "orders": {
    "total": 500,
    "success": 480,
    "pending": 20
  },
  "revenue": {
    "total": 5000000,
    "topups": 6000000,
    "profit": 1000000
  }
}
```

### Get Monthly Statistics
```json
GET /api/stats/monthly?year=2025&month=11
Authorization: Bearer <admin_token>

Response:
{
  "period": {
    "year": 2025,
    "month": 11,
    "monthName": "November"
  },
  "orders": {
    "count": 45,
    "revenue": 450000
  },
  "topups": {
    "count": 30,
    "amount": 550000
  },
  "profit": 100000
}
```

### Get Yearly Statistics
```json
GET /api/stats/yearly?year=2025
Authorization: Bearer <admin_token>

Response:
{
  "year": 2025,
  "monthly": [
    {
      "month": 1,
      "monthName": "Jan",
      "orders": { "count": 40, "revenue": 400000 },
      "topups": { "count": 35, "amount": 500000 },
      "profit": 100000
    },
    // ... 12 months
  ],
  "totals": {
    "orders": 500,
    "revenue": 5000000,
    "topups": 400,
    "topupAmount": 6000000,
    "profit": 1000000
  }
}
```

### Get Top Products
```json
GET /api/stats/top-products?limit=5
Authorization: Bearer <admin_token>

Response: [
  {
    "_id": "mobile-legends-global",
    "totalRevenue": 2000000,
    "orderCount": 200
  },
  {
    "_id": "pubg-mobile-global",
    "totalRevenue": 1500000,
    "orderCount": 150
  }
]
```

### Get Recent Activities
```json
GET /api/stats/recent-activities?page=1&limit=20
Authorization: Bearer <admin_token>

Response: {
  "orders": {
    "data": [
      {
        "_id": "order_id",
        "user": { "name": "John", "email": "john@example.com" },
        "product_key": "mobile-legends-global",
        "amount": 10000,
        "status": "success",
        "createdAt": "2025-11-14T10:30:00Z"
      }
    ],
    "pagination": {
      "total": 500,
      "page": 1,
      "limit": 20,
      "pages": 25
    }
  },
  "topups": {
    "data": [
      {
        "_id": "topup_id",
        "user": { "name": "Jane", "email": "jane@example.com" },
        "method": "kpay",
        "amount": 50000,
        "status": "approved",
        "createdAt": "2025-11-14T09:15:00Z"
      }
    ],
    "pagination": {
      "total": 400,
      "page": 1,
      "limit": 20,
      "pages": 20
    }
  }
}
```

### Initialize System Configs
```json
POST /api/system-config/init
Authorization: Bearer <admin_token>

Response: {
  "message": "System configs initialized successfully",
  "configs": [
    {
      "_id": "config_id",
      "key": "exchange_rate",
      "value": 125.79,
      "description": "THB to MMK exchange rate (1 THB = X MMK)"
    },
    {
      "_id": "config_id",
      "key": "markup_rate",
      "value": 1.10,
      "description": "Product price markup rate (e.g., 1.10 = 10% markup)"
    }
  ]
}
```

### Get All System Configs
```json
GET /api/system-config
Authorization: Bearer <admin_token>

Response: [
  {
    "_id": "config_id",
    "key": "exchange_rate",
    "value": 125.79,
    "description": "THB to MMK exchange rate (1 THB = X MMK)",
    "createdAt": "2025-11-14T10:00:00Z",
    "updatedAt": "2025-11-14T10:00:00Z"
  }
]
```

### Update System Config
```json
PUT /api/system-config/exchange_rate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "value": 130.50,
  "description": "Updated exchange rate"
}

Response: {
  "_id": "config_id",
  "key": "exchange_rate",
  "value": 130.50,
  "description": "Updated exchange rate",
  "updatedAt": "2025-11-14T11:00:00Z"
}
```

### Create or Update Config
```json
POST /api/system-config
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "key": "exchange_rate",
  "value": 128.00,
  "description": "THB to MMK rate"
}

Response: {
  "_id": "config_id",
  "key": "exchange_rate",
  "value": 128.00,
  "description": "THB to MMK rate"
}
```

---

## 🔑 Authentication & Authorization

### Authentication Headers
```
Authorization: Bearer <your_jwt_token>
```

### User Roles

#### 👤 User (Regular User)
- Can access own profile
- Can create orders and topup requests
- Can view payment accounts
- Can check own order/topup status

#### 🔐 Admin (Administrator)
- Full access to all user data
- Can manage orders, topups, products
- Can approve/reject topup requests
- Can sync products from API
- Can update user balances

### Getting Access Token

1. **Register/Login** to get JWT token
2. **Include token** in Authorization header for protected routes
3. **Admin role** assigned manually in database

---

## 📊 Query Parameters

### Products
```
GET /api/products?status=active&game=mobile
```

### Orders by User
```
GET /api/orders/user/:userId
```

### Topups by Status
```
GET /api/topups/status/pending
```

---

## 🎯 Available Games

1. **Mobile Legends (Global)** - `mobile-legends-global`
2. **Honor of Kings** - `honor-of-kings-global`
3. **Magic Chess: Go Go** - `magicchess-go-go`
4. **PUBG Mobile (Global)** - `pubg-mobile-global`
5. **Free Fire (Thailand)** - `free-fire-v1`

---

## 💱 Payment Methods

- **KPay** - `kpay`
- **Wave Pay** - `wavepay`

---

## 📌 Status Values

### Order Status
- `pending` - Order pending
- `success` - Order completed
- `refund` - Order refunded

### Topup Status
- `pending` - Awaiting approval
- `approved` - Approved & balance added
- `rejected` - Rejected by admin

### User Roles
- `user` - Regular user
- `admin` - Administrator

---

## ⚡ Response Format

### Success Response
```json
{
  "_id": "...",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## 🔧 Environment Variables

Add these to your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/sl-gaming-shop
PORT=3000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=30d
PAYSELLER_API_KEY=081647fc48d0fcf06588665c01989944
WEBHOOK_URL=http://localhost:3000/api/orders/callback
```

**Note:** In production, update `WEBHOOK_URL` to your public domain URL.

---

## 🔄 Order Flow

1. **User creates order** → System automatically submits to 24payseller API
2. **24payseller returns** `transactionId` → Saved as `external_id` in database
3. **Check status anytime** → Use `/orders/:id/check-status` endpoint
4. **Automatic updates** → 24payseller webhook calls `/orders/callback` when status changes
5. **Status synced** → Local order status automatically updated

---

## 🚀 Server Commands

```bash
# Start server
npm start

# Development mode
npm run dev
```

**Server runs on:** `http://localhost:3000`
