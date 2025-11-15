# Product Image Management System

This system automatically fetches products from 24payseller API and assigns appropriate images based on game types and item values.

## Features

- Automatic image downloading from CDN sources
- Smart caching - images are only downloaded once
- Game-specific image assignment rules
- Item-level image assignment based on diamond/UC amounts
- Automatic daily sync via cron job
- Manual sync via API endpoint

## Image Storage

All images are stored in: `uploads/products/`

Images are automatically downloaded and cached. If an image already exists, it won't be downloaded again.

## Supported Games

### Mobile Legends (Keys: mobile-legends-*, mlbb-*)
- **Game Icon**: MLBB 2025 tile
- **Item Images** based on diamond amounts:
  - < 22 diamonds
  - 22-112 diamonds
  - 112-336 diamonds
  - 336-570 diamonds
  - 1000-2000 diamonds
  - 2000-5000 diamonds
  - 5000+ diamonds
- **Special Items**:
  - Twilight Pass
  - Weekly Diamond Pass

### Magic Chess Go Go
- **Game Icon**: Magic Chess tile
- **Item Images** based on diamond amounts:
  - < 10 diamonds
  - 10-20 diamonds
  - 10-22 diamonds
  - 22-56 diamonds
  - 56-112 diamonds
  - 112-223 diamonds
  - 223-570 diamonds
  - 570-1163 diamonds
  - 1163-2398 diamonds
  - 2398-6042 diamonds
- **Special Items**:
  - Battle for Discounts
  - Lukas's Battle Bounty
  - Weekly Pass

### PUBG Mobile Global
- **Game Icon**: PUBG Mobile icon
- **Item Images** based on UC amounts:
  - 60-300 UC
  - 300-600 UC
  - 600-1500 UC
  - 1500-3000 UC
  - 3000-6000 UC

### Honor of Kings Global
- **Game Icon**: Honor of Kings tile
- **Item Images** based on token amounts:
  - 8-32 tokens
  - 32-240 tokens
  - 240-400 tokens
  - 400-560 tokens
  - 560-1200 tokens
  - 1200-2400 tokens
  - 2400-4000 tokens
  - 4000-8000 tokens

### Free Fire (Keys: free-fire-*)
- **Game Icon**: Free Fire tile
- **Item Images**: 
  - 5+ diamonds - Garena Shells image

## API Endpoints

### Manual Sync Products
```
POST /api/products/sync
Authorization: Bearer <admin_token>
```

This endpoint:
1. Fetches products from 24payseller API
2. Downloads game and item images (if not already cached)
3. Assigns images based on game rules
4. Updates database with image paths
5. Returns sync status

**Response:**
```json
{
  "message": "Successfully synced 8 products with images",
  "games": ["mobile-legends-global", ...],
  "syncedCount": 8
}
```

### Get All Products (with images)
```
GET /api/products
```

**Response:**
```json
[
  {
    "_id": "...",
    "game": "Mobile Legends: Bang Bang",
    "key": "mobile-legends-global",
    "image": "/uploads/products/game_mobile-legends-global_xyz.jpg",
    "items": [
      {
        "name": "5 Diamonds",
        "sku": "...",
        "price_mmk": 1500,
        "original_price_thb": 11,
        "image": "/uploads/products/item_mobile-legends-global_abc.png"
      }
    ],
    "status": "active"
  }
]
```

## Cron Job

The system automatically syncs products every day at **3:00 AM Myanmar Time**.

The cron job:
- Uses cached images (no re-download if exists)
- Updates prices from 24payseller
- Assigns new images for new items
- Logs sync progress to console

## File Structure

```
utils/
  ├── imageHelper.js          # Image download and caching utilities
  └── productImageMapper.js   # Image assignment rules and logic

uploads/
  └── products/               # Stored product images
      ├── game_*.png/jpg     # Game icons
      └── item_*.png/jpg     # Item-specific images

controllers/
  └── productController.js    # Includes syncProducts with image support

models/
  └── Product.js              # Schema with image fields

server.js                     # Cron job configuration
```

## How It Works

1. **Fetch Products**: System calls 24payseller API
2. **Process Each Product**:
   - Extract game key and items
   - Determine game type (Mobile Legends, PUBG, etc.)
   - Assign game icon based on key
3. **Process Each Item**:
   - Extract numeric value (diamonds/UC)
   - Match against rules (special names or numeric ranges)
   - Download image if not cached
   - Assign image path to item
4. **Save to Database**: Update product with all image paths

## Testing

To manually trigger a sync:

```bash
# Using curl (replace with your admin token)
curl -X POST http://localhost:5000/api/products/sync \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Image URL Examples

The API returns image paths like:
- `/uploads/products/game_mobile-legends-global_xyz.jpg`
- `/uploads/products/item_pubg-mobile-global_abc.png`

Frontend can access these as:
```
http://your-server.com/uploads/products/image_name.png
```

## Notes

- Images are only downloaded once (cached by filename hash)
- If external image URLs change, delete the cached file to re-download
- Cron job runs daily at 3 AM Myanmar Time
- All image downloads are logged to console
- Failed downloads won't crash the sync process
