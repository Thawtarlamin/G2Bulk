# Production Deployment Guide

## Step 1: Update Code on Server

```bash
cd /root/G2Bulk
git pull origin main
npm install
```

## Step 2: Update .env File

Production server ရဲ့ `.env` file မှာ အောက်ပါ variables တွေ ထည့်ပါ:

```bash
nano /root/G2Bulk/.env
```

**Add these lines:**
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
SESSION_SECRET=g2bulk-production-secret-key-2025-change-this-to-random-string
FRONTEND_URL=https://sl-gaming-shop.store
MOBILE_DEEP_LINK_SCHEME=g2bulk

# For OAuth Callback (production domain)
G2BULK_CALLBACK_URL=https://sl-gaming-shop.store/api/orders/callback
```

**Note:** Copy `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from your local `.env` file.

**Important:** `SESSION_SECRET` ကို random string တစ်ခုအဖြစ် ပြောင်းပေးပါ:

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Restart Server

```bash
pm2 restart all
pm2 logs server
```

## Step 4: Test Deep Linking

### Test on Mobile Browser

1. Open mobile browser
2. Go to: `https://sl-gaming-shop.store/game/mlbb`
3. Should see loading page and auto-redirect options

### Test with curl (Server terminal)

```bash
# Test Android user-agent
curl -H "User-Agent: Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36" \
  https://sl-gaming-shop.store/game/mlbb

# Test iOS user-agent
curl -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)" \
  https://sl-gaming-shop.store/game/mlbb

# Test Desktop (should redirect to web)
curl -L https://sl-gaming-shop.store/game/mlbb
```

## Step 5: Configure Google Cloud Console

### Add Production Redirect URIs:

Go to: https://console.cloud.google.com/apis/credentials

Add these URIs:
- `https://sl-gaming-shop.store/api/auth/google/callback`
- `https://sl-gaming-shop.store/auth/callback`

### Add Authorized Domains:
- `sl-gaming-shop.store`

## Step 6: Test Google OAuth

1. Visit: `https://sl-gaming-shop.store/api/auth/google`
2. Should redirect to Google login
3. After login, should redirect back to your site

## Troubleshooting

### Error: Cannot find module

```bash
cd /root/G2Bulk
npm install
pm2 restart all
```

### Error: Port already in use

```bash
pm2 delete all
pm2 start server.js --name server
pm2 logs server
```

### Error: MongoDB connection failed

```bash
# Check MongoDB status
systemctl status mongod

# Restart MongoDB
systemctl restart mongod
```

### Deep link not working

1. Check if route is registered:
```bash
grep -n "deepLinkRoutes" /root/G2Bulk/server.js
```

2. Check if file exists:
```bash
ls -la /root/G2Bulk/routes/deepLinkRoutes.js
```

3. Check server logs:
```bash
pm2 logs server --lines 100
```

### OAuth redirect error

1. Verify `.env` has correct `FRONTEND_URL`
2. Check Google Console authorized URIs
3. Clear browser cookies and try again

## Verify Installation

Run this script on production server:

```bash
#!/bin/bash
echo "=== Checking G2Bulk Production Setup ==="
echo ""

echo "1. Git Status:"
cd /root/G2Bulk && git status

echo ""
echo "2. Node Modules:"
ls -la node_modules/express-session node_modules/passport 2>&1 | head -2

echo ""
echo "3. Environment Variables:"
grep -E "(GOOGLE_|SESSION_|MOBILE_|FRONTEND_)" /root/G2Bulk/.env | sed 's/=.*$/=***/'

echo ""
echo "4. Route Files:"
ls -lh routes/*.js | wc -l
echo "Total route files found"

echo ""
echo "5. PM2 Status:"
pm2 status

echo ""
echo "6. Server Logs (last 10 lines):"
pm2 logs server --lines 10 --nostream
```

Save as `check-deployment.sh` and run:
```bash
chmod +x check-deployment.sh
./check-deployment.sh
```

## Testing Deep Link Integration

### From Mobile App (Share Feature)

```kotlin
// In your Android app's share function
fun shareGame(gameId: String, gameName: String) {
    val shareLink = "https://sl-gaming-shop.store/game/$gameId"
    val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, "Check out $gameName: $shareLink")
    }
    startActivity(Intent.createChooser(shareIntent, "Share Game"))
}
```

### From Website (Share Button)

```javascript
async function shareGame(gameId, gameName) {
  const shareLink = `https://sl-gaming-shop.store/game/${gameId}`;
  
  if (navigator.share) {
    await navigator.share({
      title: gameName,
      text: `Check out ${gameName} on G2Bulk`,
      url: shareLink
    });
  } else {
    // Fallback: Copy to clipboard
    await navigator.clipboard.writeText(shareLink);
    alert('Link copied!');
  }
}
```

## Expected Behavior

### Mobile User (App Installed):
1. Click link → `https://sl-gaming-shop.store/game/mlbb`
2. Browser opens → Shows "Opening G2Bulk..."
3. App opens automatically → Shows game detail page

### Mobile User (App Not Installed):
1. Click link → `https://sl-gaming-shop.store/game/mlbb`
2. Browser opens → Shows options:
   - "Open App" (disabled)
   - "Download from Play Store" (clickable)
   - "Continue in Browser" (fallback)

### Desktop User:
1. Click link → `https://sl-gaming-shop.store/game/mlbb`
2. Redirects to → `https://sl-gaming-shop.store/products/mlbb`
3. Shows web version of game page

## Security Notes

1. **Change SESSION_SECRET in production** - Never use default value
2. **Use HTTPS only** - Deep links work best with HTTPS
3. **Verify OAuth domains** - Only add trusted domains in Google Console
4. **Rate limiting** - Consider adding rate limiting to deep link endpoints

## Monitoring

```bash
# Watch server logs
pm2 logs server --lines 50

# Monitor server status
watch -n 5 pm2 status

# Check error logs
pm2 logs server --err --lines 100
```

## Rollback Plan

If deployment fails:

```bash
cd /root/G2Bulk
git log --oneline -5  # See recent commits
git reset --hard <previous-commit-hash>
pm2 restart all
```

## Next Steps After Deployment

1. ✅ Test deep linking on real Android device
2. ✅ Test deep linking on real iOS device
3. ✅ Test Google OAuth login flow
4. ✅ Share links on WhatsApp/Messenger and verify
5. ✅ Monitor server logs for errors
6. ✅ Set up analytics tracking for deep link usage
7. ✅ Configure Digital Asset Links for Android (assetlinks.json)
8. ✅ Test QR code generation endpoint

## Support Commands

```bash
# View all routes
grep "app.use" /root/G2Bulk/server.js

# Check if deep link route is accessible
curl -I https://sl-gaming-shop.store/game/test

# Test API endpoints
curl https://sl-gaming-shop.store/api/app-config

# Check server response time
time curl -s https://sl-gaming-shop.store/game/mlbb > /dev/null
```
