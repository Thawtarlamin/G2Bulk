## **API Routes**

- **Public:**
  - `POST /api/auth/register` : Register new user
  - `POST /api/auth/login` : Login user
  - `GET /api/products` : List all products
  - `GET /api/payment-accounts` : List payment accounts
  - `POST /api/validation/check-player` : Validate player ID before checkout

- **User (Auth required):**
  - `GET /api/auth/me` : Get current user profile
  - `PUT /api/auth/password` : Update password
  - `POST /api/orders` : Create order (balance deduction + submit to G2Bulk)
  - `GET /api/orders/:id` : Get order details
  - `POST /api/topups` : Create topup request (upload screenshot)
  - `GET /api/chat/my-chat` : Get or create user's chat
  - `POST /api/chat/:id/message` : Send chat message

- **Admin (Admin only):**
  - `GET /api/users` : List users
  - `PATCH /api/users/:id/ban` : Ban/unban user
  - `PATCH /api/users/:id/role` : Change user role
  - `GET /api/orders` : List all orders
  - `PATCH /api/topups/:id/approve` : Approve topup request
  - `POST /api/products/sync` : Sync products from G2Bulk
  - `GET /api/stats/dashboard` : Get statistics dashboard
  - `GET /api/chat/all` : Get all chats

**Usage example (player validation):**

```bash
curl -X POST http://localhost:3000/api/validation/check-player \
  -H "Content-Type: application/json" \
  -d '{"game":"mlbb","user_id":"123456789","server_id":"2001"}'
```

If you want additional details (examples, request/response samples, or a full API document), tell me which endpoints to expand and I'll add them.

