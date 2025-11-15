# Quick Start Guide - Product Image Sync

## Testing the Image Mapping Logic

Run the test file to verify image assignment rules:

```bash
node test-images.js
```

This will show which images are assigned to different games and items.

## Manual Product Sync (First Time Setup)

### 1. Ensure Server is Running

```bash
npm start
# or
npm run dev
```

### 2. Login as Admin

First, get an admin token by logging in:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-admin@email.com",
    "password": "your-password"
  }'
```

Copy the `token` from the response.

### 3. Trigger Product Sync

```bash
curl -X POST http://localhost:5000/api/products/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

This will:
- Fetch products from 24payseller
- Download all game and item images to `uploads/products/`
- Save products with image paths to database

**Expected Response:**
```json
{
  "message": "Successfully synced 8 products with images",
  "games": [
    "mobile-legends-global",
    "mobile-legends-indonesia",
    "mobile-legends-malaysia",
    "mlbb-php-flashsale",
    "mobile-legends-singapore",
    "honor-of-kings-global",
    "magicchess-go-go",
    "pubg-mobile-global"
  ],
  "syncedCount": 8
}
```

### 4. Verify Products Have Images

```bash
curl http://localhost:5000/api/products
```

Check that products have `image` field and items have `image` fields.

### 5. Access Images

Images are served as static files:

```
http://localhost:5000/uploads/products/game_mobile-legends-global_xyz.jpg
http://localhost:5000/uploads/products/item_pubg-mobile-global_abc.png
```

## Automatic Sync (Production)

Once deployed, the system automatically syncs products **every day at 3:00 AM Myanmar Time**.

The cron job:
- Uses cached images (won't re-download existing files)
- Updates prices from 24payseller API
- Adds images for new products/items
- Logs progress to console

## Checking Sync Status

View server logs to see sync progress:

```
Running daily product sync with images...
Processing images for mobile-legends-global...
Image already exists: game_mobile-legends-global_xyz.jpg
Image already exists: item_mobile-legends-global_abc.png
✓ Synced mobile-legends-global with images
Daily sync completed: 8 products updated with images
```

## Troubleshooting

### Images Not Downloading

1. Check internet connection
2. Verify CDN URLs are accessible
3. Check `uploads/products/` folder permissions
4. View console logs for download errors

### Re-download Images

If image URLs change, delete the cached file:

```bash
# Windows
Remove-Item uploads\products\game_mobile-legends-global_*.jpg

# Linux/Mac
rm uploads/products/game_mobile-legends-global_*.jpg
```

Then trigger sync again.

### Sync Manually (Alternative)

Using Postman or Thunder Client:
- Method: POST
- URL: `http://localhost:5000/api/products/sync`
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Body: (none)

## Frontend Integration

### Display Product with Images

```javascript
// Fetch products
const response = await fetch('http://localhost:5000/api/products');
const products = await response.json();

// Display product
products.forEach(product => {
  console.log(`Game: ${product.game}`);
  console.log(`Icon: ${BASE_URL}${product.image}`);
  
  product.items.forEach(item => {
    console.log(`  ${item.name}: ${item.price_mmk} MMK`);
    if (item.image) {
      console.log(`  Image: ${BASE_URL}${item.image}`);
    }
  });
});
```

### React Example

```jsx
function ProductCard({ product }) {
  const BASE_URL = 'http://localhost:5000';
  
  return (
    <div>
      <img 
        src={`${BASE_URL}${product.image}`} 
        alt={product.game}
      />
      <h3>{product.game}</h3>
      
      {product.items.map(item => (
        <div key={item.sku}>
          {item.image && (
            <img 
              src={`${BASE_URL}${item.image}`}
              alt={item.name}
            />
          )}
          <p>{item.name} - {item.price_mmk} MMK</p>
        </div>
      ))}
    </div>
  );
}
```

## Storage Management

Images are cached permanently until deleted. To clean up:

```bash
# See current storage
du -sh uploads/products/

# Delete all cached images (will re-download on next sync)
rm -rf uploads/products/*
```

## Notes

- Images are downloaded once and cached
- Cron job runs daily at 3 AM Myanmar Time
- Manual sync available via API endpoint
- All image downloads are logged
- Failed downloads won't stop the sync process
- Images are served as static files from `/uploads/products/`
