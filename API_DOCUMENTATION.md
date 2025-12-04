# G2Bulk Gaming Shop API Documentation

## Base URL
```
Development: http://localhost:3000
Production: https://yourdomain.com
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "09123456789"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "09123456789",
    "role": "user",
    "balance": 0
  }
}
```

### Login
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "balance": 1000
  }
}
```

### Get Current User Profile
**GET** `/api/auth/me` 🔒

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "09123456789",
  "role": "user",
  "balance": 1000,
  "isBanned": false,
  "createdAt": "2025-12-04T10:00:00.000Z"
}
```

### Update Password
**PUT** `/api/auth/password` 🔒

**Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### Get G2Bulk Account Info (Admin Only)
**GET** `/api/auth/g2bulk-me` 🔒👑

**Response:**
```json
{
  "email": "admin@g2bulk.com",
  "balance": 50000,
  "currency": "THB"
}
```

---

## 🎮 Product Endpoints

### Get All Products
**GET** `/api/products`

**Response:**
```json
[
  {
    "_id": "...",
    "game": {
      "code": "mobile-legends",
      "name": "Mobile Legends",
      "image_url": "https://..."
    },
    "catalogues": [
      {
        "id": 1,
        "name": "86 Diamonds",
        "amount": 2500
      },
      {
        "id": 2,
        "name": "172 Diamonds",
        "amount": 5000
      }
    ],
    "tag": "game",
    "status": "active"
  }
]
```

### Get Product by ID
**GET** `/api/products/:id`

**Response:** Single product object

### Get Product by Game Code
**GET** `/api/products/key/:key`

**Example:** `/api/products/key/mobile-legends`

### Create Product (Admin Only)
**POST** `/api/products` 🔒👑

**Body:**
```json
{
  "game": {
    "code": "mobile-legends",
    "name": "Mobile Legends",
    "image_url": "https://example.com/ml.jpg"
  },
  "catalogues": [
    {
      "id": 1,
      "name": "86 Diamonds",
      "amount": 2500
    },
    {
      "id": 2,
      "name": "172 Diamonds",
      "amount": 5000
    }
  ],
  "tag": "game"
}
```

### Update Product (Admin Only)
**PUT** `/api/products/:id` 🔒👑

### Delete Product (Admin Only)
**DELETE** `/api/products/:id` 🔒👑

---

## 📦 Order Endpoints

### Get All Orders (Admin Only)
**GET** `/api/orders` 🔒👑

### Get Order by ID
**GET** `/api/orders/:id` 🔒

### Get User's Orders
**GET** `/api/orders/user/:userId` 🔒

### Create Order
**POST** `/api/orders` 🔒

**Body:**
```json
{
  "product_code": "mobile-legends",
  "catalogue_name": "86 Diamonds",
  "player_id": "123456789",
  "server_id": "1234",
  "remark": "Please deliver quickly"
}
```

**Response:**
```json
{
  "_id": "...",
  "user": "...",
  "product_code": "mobile-legends",
  "catalogue_name": "86 Diamonds",
  "player_id": "123456789",
  "server_id": "1234",
  "amount": 2500,
  "external_id": "12345",
  "status": "pending",
  "createdAt": "2025-12-04T10:00:00.000Z",
  "g2bulk_response": {...}
}
```

### Check Order Status from G2Bulk
**GET** `/api/orders/:id/check-status` 🔒

### Update Order Status (Admin Only)
**PATCH** `/api/orders/:id/status` 🔒👑

**Body:**
```json
{
  "status": "completed"
}
```

**Status Options:** `pending`, `processing`, `completed`, `failed`, `refunded`, `confirming`

### G2Bulk Callback Webhook
**POST** `/api/orders/callback` (No Auth Required)

**Body:**
```json
{
  "order_id": "12345",
  "status": "COMPLETED",
  "game": "mobile-legends",
  "message": "Order successful"
}
```

---

## 💰 Top-up Endpoints

### Get All Top-ups (Admin Only)
**GET** `/api/topups` 🔒👑

### Get Top-up by ID
**GET** `/api/topups/:id` 🔒

### Get User's Top-ups
**GET** `/api/topups/user/:userId` 🔒

### Create Top-up Request
**POST** `/api/topups` 🔒

**Body (multipart/form-data):**
```
method: "KBZ Pay"
amount: 10000
screenshot: [FILE]
```

**Response:**
```json
{
  "_id": "...",
  "user": "...",
  "method": "KBZ Pay",
  "amount": 10000,
  "screenshot_url": "/uploads/...",
  "status": "pending",
  "createdAt": "2025-12-04T10:00:00.000Z"
}
```

### Update Top-up Status (Admin Only)
**PATCH** `/api/topups/:id/status` 🔒👑

**Body:**
```json
{
  "status": "approved",
  "admin_note": "Payment verified"
}
```

**Status Options:** `pending`, `approved`, `rejected`

### Delete Top-up (Admin Only)
**DELETE** `/api/topups/:id` 🔒👑

---

## 💳 Payment Account Endpoints

### Get All Payment Accounts
**GET** `/api/payment-accounts`

**Response:**
```json
[
  {
    "_id": "...",
    "method": "KBZ Pay",
    "account_name": "John Doe",
    "account_number": "09123456789",
    "qr_code_url": "/uploads/kbz-qr.jpg",
    "status": "active"
  }
]
```

### Get Active Payment Accounts
**GET** `/api/payment-accounts/active`

### Create Payment Account (Admin Only)
**POST** `/api/payment-accounts` 🔒👑

**Body (multipart/form-data):**
```
method: "KBZ Pay"
account_name: "John Doe"
account_number: "09123456789"
qr_code: [FILE]
```

### Update Payment Account (Admin Only)
**PUT** `/api/payment-accounts/:id` 🔒👑

### Delete Payment Account (Admin Only)
**DELETE** `/api/payment-accounts/:id` 🔒👑

---

## 👥 User Management Endpoints (Admin Only)

### Get All Users
**GET** `/api/users` 🔒👑

### Get User by ID
**GET** `/api/users/:id` 🔒👑

### Update User Balance
**PATCH** `/api/users/:id/balance` 🔒👑

**Body:**
```json
{
  "amount": 5000,
  "action": "add"
}
```

**Action Options:** `add`, `subtract`

### Ban/Unban User
**PATCH** `/api/users/:id/ban` 🔒👑

**Body:**
```json
{
  "isBanned": true,
  "banReason": "Violation of terms"
}
```

### Delete User
**DELETE** `/api/users/:id` 🔒👑

---

## 💬 Chat Endpoints

### Get All Chats (Admin Only)
**GET** `/api/chat` 🔒👑

### Get Chat by ID
**GET** `/api/chat/:id` 🔒

### Get User's Active Chat
**GET** `/api/chat/user/:userId` 🔒

### Create New Chat
**POST** `/api/chat` 🔒

**Body:**
```json
{
  "message": "Hello, I need help!"
}
```

### Send Message
**POST** `/api/chat/:chatId/message` 🔒

**Body:**
```json
{
  "message": "Can you help me with my order?"
}
```

### Close Chat
**PATCH** `/api/chat/:chatId/close` 🔒

---

## 📊 Statistics Endpoints (Admin Only)

### Get Dashboard Stats
**GET** `/api/stats/dashboard` 🔒👑

**Response:**
```json
{
  "totalRevenue": 500000,
  "totalOrders": 1234,
  "totalUsers": 567,
  "pendingTopups": 12,
  "todayRevenue": 45000,
  "todayOrders": 89,
  "recentOrders": [...],
  "topProducts": [...]
}
```

### Get Revenue by Date Range
**GET** `/api/stats/revenue?startDate=2025-12-01&endDate=2025-12-31` 🔒👑

### Get Product Sales
**GET** `/api/stats/product-sales` 🔒👑

### Get User Statistics
**GET** `/api/stats/users` 🔒👑

---

## ⚙️ System Configuration Endpoints (Admin Only)

### Get All Configs
**GET** `/api/system-config` 🔒👑

### Get Config by Key
**GET** `/api/system-config/:key` 🔒👑

### Update Config
**PUT** `/api/system-config/:key` 🔒👑

**Body:**
```json
{
  "value": 130.50
}
```

**Common Config Keys:**
- `exchange_rate` - USD to MMK exchange rate
- `markup_rate` - Markup percentage (e.g., 1.10 = 10% markup)
- `min_topup_amount` - Minimum top-up amount
- `maintenance_mode` - Enable/disable maintenance mode

---

## 🔍 Player Validation Endpoint

### Validate Player ID
**POST** `/api/validation/validate-player`

**Body:**
```json
{
  "game": "mobile-legends",
  "user_id": "123456789",
  "server_id": "1234"
}
```

**Response:**
```json
{
  "valid": true,
  "player_name": "PlayerName123",
  "message": "Player ID is valid"
}
```

---

## 🔄 Real-time Features (Socket.io)

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

### Events

**Client → Server:**
- `join_chat` - Join a chat room
- `typing` - User is typing
- `stop_typing` - User stopped typing

**Server → Client:**
- `order_completed` - Order status updated to completed
- `orderStatusUpdate` - Real-time order status changes
- `new_message` - New chat message received
- `typing` - Someone is typing
- `stop_typing` - Stopped typing

---

## 📝 Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (No token or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔑 Legend

- 🔒 - Requires Authentication (JWT Token)
- 👑 - Requires Admin Role
- No icon - Public endpoint

---

## 📌 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All amounts are in Myanmar Kyat (MMK) unless specified
3. File uploads use `multipart/form-data` encoding
4. Maximum file size for uploads: 5MB
5. JWT tokens expire after 30 days by default
6. G2Bulk callback URL must be configured in `.env` file
