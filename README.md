## **API Routes**

### **Public Routes**
- `POST /api/auth/register` : Register new user
- `POST /api/auth/login` : Login user
- `GET /api/products` : List all products
- `GET /api/products/key/:key` : Get product by game code
- `GET /api/products/tag/:tag` : Get products by tag name
- `GET /api/payment-accounts` : List payment accounts
- `POST /api/validation/check-player` : Validate player ID before checkout
- `GET /api/tags` : Get all tags (query: ?status=active/inactive)
- `GET /api/tags/search/:query` : Search tags by name
- `GET /api/tags/:id` : Get single tag by ID
- `GET /api/app-config` : Get app configuration (ad_text, tags, view_pager)

### **User Routes (Auth required)**
- `GET /api/auth/me` : Get current user profile
- `PUT /api/auth/password` : Update password
- `POST /api/orders` : Create order (balance deduction + submit to G2Bulk)
- `GET /api/orders/:id` : Get order details
- `POST /api/topups` : Create topup request (upload screenshot to Cloudinary)
- `GET /api/chat/my-chat` : Get or create user's chat
- `POST /api/chat/:id/message` : Send chat message

### **Admin Routes (Admin only)**

**User Management:**
- `GET /api/users` : List all users
- `PATCH /api/users/:id/ban` : Ban/unban user
- `PATCH /api/users/:id/role` : Change user role

**Product Management:**
- `POST /api/products` : Create product (with image upload, requires valid tag)
- `PUT /api/products/:id` : Update product (with image upload, requires valid tag)
- `DELETE /api/products/:id` : Delete product (removes Cloudinary image)
- `POST /api/products/sync` : Sync products from G2Bulk

**Tag Management:**
- `POST /api/tags` : Create new tag
- `PUT /api/tags/:id` : Update tag
- `DELETE /api/tags/:id` : Delete tag

**Order & Topup Management:**
- `GET /api/orders` : List all orders
- `PATCH /api/topups/:id/approve` : Approve topup request

**Chat Management:**
- `GET /api/chat/all` : Get all chats

**App Configuration:**
- `POST /api/app-config` : Create/update app config (with multiple image uploads)
- `PUT /api/app-config/ad-text` : Update ad text only
- `POST /api/app-config/tags` : Add tag to app config
- `DELETE /api/app-config/tags/:index` : Remove tag by index
- `POST /api/app-config/view-pager` : Add view pager image (Cloudinary upload)
- `DELETE /api/app-config/view-pager/:index` : Remove view pager image by index
- `DELETE /api/app-config` : Delete entire app config

**Statistics:**
- `GET /api/stats/dashboard` : Get statistics dashboard

---

## **Usage Examples**

### Player Validation
```bash
curl -X POST http://localhost:3000/api/validation/check-player \
  -H "Content-Type: application/json" \
  -d '{"game":"mlbb","user_id":"123456789","server_id":"2001"}'
```

### Create Tag (Admin)
```bash
curl -X POST http://localhost:3000/api/tags \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mobile Legends","status":"active"}'
```

### Create Product with Tag (Admin)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F 'game={"code":"mlbb","name":"Mobile Legends"}' \
  -F 'catalogues=[{"name":"60 Diamonds","amount":1500}]' \
  -F "tag=Mobile Legends"
```

### Get Products by Tag
```bash
curl http://localhost:3000/api/products/tag/Mobile%20Legends
```

### Upload View Pager Image (Admin)
```bash
curl -X POST http://localhost:3000/api/app-config/view-pager \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "image=@/path/to/banner.jpg"
```

### Update App Config with Multiple Images (Admin)
```bash
curl -X POST http://localhost:3000/api/app-config \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "ad_text=အကောင့်တွင်ငွေဖြည့်ပြီးအရောက်ပါက page တွင်ဆက်သွယ်ပြောဆိုပေးပါ"
```

---

## **Notes**

- Protected routes require `Authorization: Bearer <token>` header
- File uploads use Cloudinary (multer memory storage)
- Products must have valid tags from Tag database
- View pager images stored in `g2bulk/view-pager` folder on Cloudinary
- Product images stored in `g2bulk/products` folder on Cloudinary
- Topup screenshots stored in `g2bulk/topups` folder on Cloudinary

---

**Server:** `http://localhost:3000` (or PORT from .env)

**Run:** `npm run dev`

