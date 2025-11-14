# Flutter App - User API Routes

Base URL: `http://your-server:3000/api`

## Authentication Required
All requests must include JWT token in headers:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication

### Register
```dart
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "balance": 0,
  "role": "user",
  "token": "jwt_token_here"
}
```

### Login
```dart
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "balance": 5000,
  "role": "user",
  "token": "jwt_token_here"
}
```

### Get Profile
```dart
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "balance": 5000,
  "role": "user",
  "isBanned": false,
  "createdAt": "2025-11-13T10:00:00.000Z"
}
```

### Change Password
```dart
PUT /auth/password
Authorization: Bearer <token>
Content-Type: application/json

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

---

## 👤 User Profile

### Get Own Profile by ID
```dart
GET /users/:id
Authorization: Bearer <token>

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "balance": 5000,
  "role": "user"
}
```

### Update Own Profile
```dart
PUT /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated"
}

Response:
{
  "_id": "user_id",
  "name": "John Updated",
  "email": "john@example.com",
  "balance": 5000
}
```

---

## 🎮 Products

### Get All Products
```dart
GET /products
Authorization: Bearer <token>

Response: [
  {
    "_id": "product_id",
    "name": "Mobile Legends",
    "product_key": "mobile-legends-global",
    "items": [
      {
        "name": "86 Diamonds",
        "sku": "ml_86_diamonds",
        "price_mmk": 1320,
        "original_price_thb": 20
      }
    ]
  }
]
```

### Get Product by ID
```dart
GET /products/:id
Authorization: Bearer <token>

Response:
{
  "_id": "product_id",
  "name": "Mobile Legends",
  "product_key": "mobile-legends-global",
  "items": [...]
}
```

---

## 🛒 Orders

### Create Order
**URL:** `/orders`  
**Method:** `POST`  
**Auth Required:** Yes  
**Note:** User ID auto-detected from JWT token, price auto-calculated, balance auto-deducted

**Required Fields:**
- `product_key` (String) - Product key (e.g., "mobile-legends-global")
- `item_sku` (String) - Item SKU from product
- `input` (Object) - Game-specific input (e.g., {"uid": "123456789", "server": "Asia"})

```dart
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_key": "mobile-legends-global",
  "item_sku": "ml_86_diamonds",
  "input": {
    "uid": "123456789",
    "server": "Asia"
  }
}

Response:
{
  "_id": "order_id",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "product_key": "mobile-legends-global",
  "item_sku": "ml_86_diamonds",
  "input": {
    "uid": "123456789",
    "server": "Asia"
  },
  "external_id": "pay_transaction_12345",
  "status": "pending",
  "amount": 1320,
  "createdAt": "2025-11-14T10:30:00.000Z",
  "payseller_response": {
    "transactionId": "pay_transaction_12345",
    "status": "pending"
  }
}

Error (Insufficient Balance):
{
  "message": "Insufficient balance",
  "required": 1320,
  "current": 500,
  "shortage": 820
}
```

**Process Flow:**
1. System finds product and item by key/sku
2. Gets price_mmk from item
3. Checks user balance
4. Deducts balance if sufficient
5. Creates order in 24payseller
6. Saves order to database
7. Refunds balance if 24payseller fails

### Get Order by ID
**URL:** `/orders/:id`  
**Method:** `GET`  
**Auth Required:** Yes

```dart
GET /orders/:id
Authorization: Bearer <token>

Response:
{
  "_id": "order_id",
  "user": {...},
  "product_key": "mobile-legends-global",
  "status": "success",
  "amount": 1320,
  "external_id": "pay_transaction_12345",
  "createdAt": "2025-11-14T10:30:00.000Z"
}
```

### Get My Orders
**URL:** `/orders/user/:userId`  
**Method:** `GET`  
**Auth Required:** Yes  
**Note:** Replace `:userId` with your user ID

```dart
GET /orders/user/:userId
Authorization: Bearer <token>

Response: [
  {
    "_id": "order_id",
    "product_key": "mobile-legends-global",
    "item_sku": "ml_86_diamonds",
    "status": "success",
    "amount": 1320,
    "createdAt": "2025-11-14T10:30:00.000Z"
  }
]
```

### Check Order Status
**URL:** `/orders/:id/check-status`  
**Method:** `GET`  
**Auth Required:** Yes

```dart
GET /orders/:id/check-status
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

**Order Status Values:**
- `pending` - Order submitted, waiting for processing
- `processing` - Being processed by game server
- `success` - Completed successfully
- `failed` - Failed (balance will be refunded by admin)

---

## 💳 Payment Accounts

### Get All Payment Accounts
```dart
GET /payment-accounts
Authorization: Bearer <token>

Response: [
  {
    "_id": "account_id",
    "name": "KBZ Pay",
    "method": "kpay",
    "account_number": "09123456789",
    "account_name": "SL Gaming Shop"
  }
]
```

### Get Payment Account by ID
```dart
GET /payment-accounts/:id
Authorization: Bearer <token>

Response:
{
  "_id": "account_id",
  "name": "KBZ Pay",
  "method": "kpay",
  "account_number": "09123456789",
  "account_name": "SL Gaming Shop"
}
```

### Get Accounts by Method
```dart
GET /payment-accounts/method/:method
Authorization: Bearer <token>
# method = kpay or wavepay

Response: [
  {
    "_id": "account_id",
    "name": "KBZ Pay",
    "method": "kpay",
    "account_number": "09123456789"
  }
]
```

---

## 💰 Topups

### Option 1: Upload Screenshot First (Recommended)

#### Upload Screenshot
**URL:** `/topups/upload-screenshot`  
**Method:** `POST`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

```dart
POST /topups/upload-screenshot
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- screenshot: (file) - Image file (JPEG, PNG, GIF, WEBP)

Response:
{
  "message": "Screenshot uploaded successfully",
  "url": "/uploads/screenshots/screenshot-1234567890-123456789.jpg",
  "filename": "screenshot-1234567890-123456789.jpg"
}
```

**File Requirements:**
- Allowed formats: JPEG, JPG, PNG, GIF, WEBP
- Maximum size: 5MB
- The URL returned should be used in topup request

#### Create Topup Request (After Upload)
**URL:** `/topups`  
**Method:** `POST`  
**Auth Required:** Yes

**Required Fields:**
- `amount` (Number) - Topup amount in MMK (must be positive number)
- `payment_method` (String) - Payment method: `"kpay"` or `"wavepay"`
- `transaction_id` (String) - Your transaction reference ID
- `screenshot_url` (String) - URL from upload response
- `last_six_digit` (Number) - Last 6 digits of phone number used for payment

```dart
POST /topups
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 10000,
  "payment_method": "kpay",
  "transaction_id": "TXN123456",
  "screenshot_url": "/uploads/screenshots/screenshot-1234567890-123456789.jpg",
  "last_six_digit": 456789
}

Response:
{
  "_id": "topup_id",
  "user": "user_id",
  "method": "kpay",
  "amount": 10000,
  "transaction_id": "TXN123456",
  "screenshot_url": "/uploads/screenshots/screenshot-1234567890-123456789.jpg",
  "last_six_digit": 456789,
  "status": "pending",
  "createdAt": "2025-11-13T10:00:00.000Z"
}
```

### Option 2: Upload and Create in One Request

**URL:** `/topups`  
**Method:** `POST`  
**Auth Required:** Yes  
**Content-Type:** `multipart/form-data`

```dart
POST /topups
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
- amount: 10000
- payment_method: kpay
- transaction_id: TXN123456
- screenshot: (file)
- last_six_digit: 456789

Response: Same as above
```

**Validation:**
- Amount must be a positive number
- Payment method must be either "kpay" or "wavepay"
- Transaction ID is required
- Screenshot file or URL is required
- Last 6 digits of payment phone number required

### Get Topup by ID
**URL:** `/topups/:id`  
**Method:** `GET`  
**Auth Required:** Yes

```dart
GET /topups/:id
Authorization: Bearer <token>

Response:
{
  "_id": "topup_id",
  "user": {...},
  "amount": 10000,
  "payment_method": "kpay",
  "status": "approved",
  "transaction_id": "TXN123456"
}
```

### Get My Topups
**URL:** `/topups/user/:userId`  
**Method:** `GET`  
**Auth Required:** Yes  
**Note:** Replace `:userId` with your own user ID

```dart
GET /topups/user/:userId
Authorization: Bearer <token>

Response: [
  {
    "_id": "topup_id",
    "amount": 10000,
    "payment_method": "kpay",
    "status": "approved",
    "createdAt": "2025-11-13T10:00:00.000Z"
  }
]
```

**Topup Status Values:**
- `pending` - Waiting for admin approval
- `approved` - Approved and balance added
- `rejected` - Rejected by admin

---

## 💬 Live Chat

### Get My Chat
```dart
GET /chat/my-chat
Authorization: Bearer <token>

Response:
{
  "_id": "chat_id",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "messages": [
    {
      "_id": "msg_id",
      "sender": "user",
      "senderName": "John Doe",
      "message": "Hello",
      "timestamp": "2025-11-13T10:30:00.000Z",
      "isRead": true
    }
  ],
  "status": "active",
  "unreadCount": {
    "user": 0,
    "admin": 1
  },
  "lastMessageAt": "2025-11-13T10:30:00.000Z"
}
```

### Send Message
```dart
POST /chat/:id/message
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "Hello, I need help with my order"
}

Response:
{
  "_id": "chat_id",
  "messages": [
    {
      "_id": "msg_id",
      "sender": "user",
      "senderName": "John Doe",
      "message": "Hello, I need help with my order",
      "timestamp": "2025-11-13T10:30:00.000Z",
      "isRead": false
    }
  ],
  "unreadCount": {
    "user": 0,
    "admin": 1
  }
}
```

### Mark Messages as Read
```dart
PATCH /chat/:id/read
Authorization: Bearer <token>

Response:
{
  "_id": "chat_id",
  "unreadCount": {
    "user": 0,
    "admin": 0
  }
}
```

---

## 🔌 Socket.io Real-Time Chat

### Connect to Socket
```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

IO.Socket socket = IO.io('http://your-server:3000', 
  IO.OptionBuilder()
    .setTransports(['websocket'])
    .setAuth({'token': 'your_jwt_token'})
    .build()
);

socket.connect();
```

### Listen for New Messages
```dart
socket.on('new_message', (data) {
  print('New message: ${data['message']['message']}');
  // Update UI with new message
});
```

### Listen for Messages Read
```dart
socket.on('messages_read', (data) {
  print('Unread count: ${data['unreadCount']}');
  // Update unread badge
});
```

### Listen for Typing
```dart
socket.on('typing', (data) {
  print('${data['senderName']} is typing...');
  // Show typing indicator
});

socket.on('stop_typing', (_) {
  // Hide typing indicator
});
```

### Send Typing Indicator
```dart
// When user types
socket.emit('typing', {'chatId': chatId});

// When user stops typing (after 2-3 seconds)
socket.emit('stop_typing', {'chatId': chatId});
```

### Join Chat Room
```dart
socket.emit('join_chat', chatId);
```

### Handle Errors
```dart
socket.onConnectError((data) {
  print('Connection error: $data');
});

socket.onError((data) {
  print('Socket error: $data');
});
```

---

## 📱 Flutter HTTP Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  final String baseUrl = 'http://your-server:3000/api';
  String? token;

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      token = data['token'];
      return data;
    } else {
      throw Exception('Login failed');
    }
  }

  // Get Products
  Future<List<dynamic>> getProducts() async {
    final response = await http.get(
      Uri.parse('$baseUrl/products'),
      headers: {'Authorization': 'Bearer $token'},
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load products');
    }
  }

  // Create Order (Updated - no user field needed)
  Future<Map<String, dynamic>> createOrder(
    String productKey, 
    String itemSku, 
    Map<String, dynamic> input
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/orders'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'product_key': productKey,
        'item_sku': itemSku,
        'input': input,
      }),
    );
    
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 400) {
      final error = jsonDecode(response.body);
      if (error['message'] == 'Insufficient balance') {
        throw Exception('Insufficient balance: ${error['shortage']} MMK short');
      }
      throw Exception(error['message']);
    } else {
      throw Exception('Failed to create order');
    }
  }

  // Get My Orders
  Future<List<dynamic>> getMyOrders(String userId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders/user/$userId'),
      headers: {'Authorization': 'Bearer $token'},
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load orders');
    }
  }

  // Check Order Status
  Future<Map<String, dynamic>> checkOrderStatus(String orderId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/orders/$orderId/check-status'),
      headers: {'Authorization': 'Bearer $token'},
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to check order status');
    }
  }

  // Upload Screenshot
  Future<String> uploadScreenshot(File imageFile) async {
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/topups/upload-screenshot'),
    );
    
    request.headers['Authorization'] = 'Bearer $token';
    request.files.add(
      await http.MultipartFile.fromPath('screenshot', imageFile.path),
    );
    
    var response = await request.send();
    var responseData = await response.stream.bytesToString();
    
    if (response.statusCode == 200) {
      final data = jsonDecode(responseData);
      return data['url'];
    } else {
      throw Exception('Failed to upload screenshot');
    }
  }

  // Create Topup (Method 1: With pre-uploaded screenshot URL)
  Future<Map<String, dynamic>> createTopup(
    int amount,
    String method,
    String transactionId,
    String screenshotUrl,
    int lastSixDigit
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/topups'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'amount': amount,
        'payment_method': method,
        'transaction_id': transactionId,
        'screenshot_url': screenshotUrl,
        'last_six_digit': lastSixDigit,
      }),
    );
    
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create topup');
    }
  }

  // Create Topup (Method 2: Upload and create in one request)
  Future<Map<String, dynamic>> createTopupWithFile(
    int amount,
    String method,
    String transactionId,
    File imageFile,
    int lastSixDigit
  ) async {
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/topups'),
    );
    
    request.headers['Authorization'] = 'Bearer $token';
    request.fields['amount'] = amount.toString();
    request.fields['payment_method'] = method;
    request.fields['transaction_id'] = transactionId;
    request.fields['last_six_digit'] = lastSixDigit.toString();
    request.files.add(
      await http.MultipartFile.fromPath('screenshot', imageFile.path),
    );
    
    var response = await request.send();
    var responseData = await response.stream.bytesToString();
    
    if (response.statusCode == 201) {
      return jsonDecode(responseData);
    } else {
      throw Exception('Failed to create topup');
    }
  }
}
```

---

## 🔴 Error Responses

### 400 Bad Request
```json
{
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, token failed"
}
```

### 403 Forbidden (Banned)
```json
{
  "message": "Account has been banned",
  "reason": "Violation of terms",
  "bannedAt": "2025-11-13T10:00:00.000Z"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "Internal server error"
}
```

---

## 📦 Required Flutter Packages

Add to `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.1.0
  socket_io_client: ^2.0.3+1
  shared_preferences: ^2.2.2  # For storing token
  image_picker: ^1.0.7  # For selecting images
  path: ^1.8.3  # For file path operations
```

---

## 💡 Tips

1. **Token Storage**: Save JWT token in SharedPreferences after login
2. **Error Handling**: Always check response status codes
3. **Socket Connection**: Connect to socket after successful login
4. **Reconnection**: Implement socket reconnection logic
5. **Loading States**: Show loading indicators during API calls
6. **Offline Mode**: Cache data locally when possible
7. **Image Upload**: 
   - Use `image_picker` package to select images
   - Compress images before upload to reduce size
   - Upload screenshot first, then create topup with URL
   - Or use single multipart request for both
8. **Refresh Token**: Implement token refresh before expiry (30 days)
9. **Image Display**: Access uploaded images via `http://your-server:3000/uploads/screenshots/filename.jpg`

---

## 🔒 Security Notes

- Never store password in plain text
- Always use HTTPS in production
- Validate all inputs before sending
- Handle token expiry gracefully
- Implement rate limiting on client side
- Clear token on logout
