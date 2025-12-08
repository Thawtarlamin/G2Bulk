# Deep Linking Setup Guide

## Overview
Deep linking system ဆိုတာ web link တစ်ခုကို click လုပ်တဲ့အခါ mobile app ကိုတိုက်ရိုက်ဖွင့်ပေးတဲ့ system ပါ။

## Backend Implementation

### API Endpoints

#### 1. Game Deep Link Handler
```
GET /game/:gameId
```

**Example:**
```
https://sl-gaming-shop.store/game/mlbb
https://sl-gaming-shop.store/game/pubg
```

**Behavior:**
- **Android Device**: Try to open app (`g2bulk://game/mlbb`), show Play Store link if app not installed
- **iOS Device**: Try to open app, show App Store link if app not installed
- **Desktop/Other**: Redirect to web version (`https://sl-gaming-shop.store/products/mlbb`)

#### 2. Generate Deep Link
```
POST /game/link
```

**Request Body:**
```json
{
  "gameId": "mlbb",
  "gameName": "Mobile Legends"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deepLink": "https://sl-gaming-shop.store/game/mlbb",
    "gameId": "mlbb",
    "gameName": "Mobile Legends",
    "qrCode": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=..."
  }
}
```

## Android App Setup

### 1. AndroidManifest.xml

```xml
<activity
    android:name=".MainActivity"
    android:launchMode="singleTask">
    
    <!-- Deep Link for game routing -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <!-- Pattern: g2bulk://game/GAME_ID -->
        <data
            android:scheme="g2bulk"
            android:host="game"
            android:pathPattern="/.*" />
    </intent-filter>
    
    <!-- HTTP/HTTPS links -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="sl-gaming-shop.store"
            android:pathPrefix="/game" />
    </intent-filter>
</activity>
```

### 2. Handle Deep Links in Activity

```kotlin
class MainActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        handleDeepLink(intent)
    }
    
    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleDeepLink(intent)
    }
    
    private fun handleDeepLink(intent: Intent?) {
        val data: Uri? = intent?.data
        
        if (data != null) {
            when (data.scheme) {
                "g2bulk" -> {
                    // Custom scheme: g2bulk://game/mlbb
                    if (data.host == "game") {
                        val gameId = data.pathSegments?.firstOrNull()
                        if (gameId != null) {
                            navigateToGame(gameId)
                        }
                    }
                }
                "https", "http" -> {
                    // Web link: https://sl-gaming-shop.store/game/mlbb
                    if (data.host == "sl-gaming-shop.store" && data.path?.startsWith("/game/") == true) {
                        val gameId = data.lastPathSegment
                        if (gameId != null) {
                            navigateToGame(gameId)
                        }
                    }
                }
            }
        }
    }
    
    private fun navigateToGame(gameId: String) {
        // Navigate to game detail screen
        val intent = Intent(this, GameDetailActivity::class.java)
        intent.putExtra("GAME_ID", gameId)
        startActivity(intent)
        
        // Or use Navigation Component
        // findNavController().navigate(
        //     R.id.gameDetailFragment,
        //     bundleOf("gameId" to gameId)
        // )
    }
}
```

### 3. Test Deep Links

```bash
# Test with ADB
adb shell am start -W -a android.intent.action.VIEW -d "g2bulk://game/mlbb" com.g2bulk.gamingshop

adb shell am start -W -a android.intent.action.VIEW -d "https://sl-gaming-shop.store/game/mlbb" com.g2bulk.gamingshop
```

## Frontend Integration

### Share Button Implementation

```javascript
// Generate shareable link
const shareGame = async (gameId, gameName) => {
  try {
    const response = await fetch('https://sl-gaming-shop.store/game/link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId,
        gameName
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Native share
      if (navigator.share) {
        await navigator.share({
          title: gameName,
          text: `Check out ${gameName} on G2Bulk Gaming Shop`,
          url: result.data.deepLink
        });
      } else {
        // Copy to clipboard
        await navigator.clipboard.writeText(result.data.deepLink);
        alert('Link copied to clipboard!');
      }
    }
  } catch (error) {
    console.error('Share failed:', error);
  }
};

// Usage
<button onClick={() => shareGame('mlbb', 'Mobile Legends')}>
  Share Game
</button>
```

### QR Code Generation

```javascript
// Get QR code for game
const getGameQR = async (gameId, gameName) => {
  const response = await fetch('https://sl-gaming-shop.store/game/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ gameId, gameName })
  });
  
  const result = await response.json();
  
  if (result.success) {
    return result.data.qrCode;
  }
};

// Display QR code
<img src={qrCodeUrl} alt="Scan to open game" />
```

## Testing Flow

### 1. Web Browser (Mobile)
```
1. Open: https://sl-gaming-shop.store/game/mlbb
2. See loading page with "Opening G2Bulk Gaming Shop..."
3. Options shown:
   - "Open App" (if installed)
   - "Download from Play Store" (if not installed)
   - "Continue in Browser" (fallback)
```

### 2. App Installed
```
1. Click link → App opens automatically
2. Navigate to game detail page
3. User can purchase directly
```

### 3. App Not Installed
```
1. Click link → See options page
2. User clicks "Download from Play Store"
3. Install app
4. Click link again → App opens
```

## Deep Link Patterns

### Supported URLs
```
g2bulk://game/mlbb                              ← Custom scheme
g2bulk://game/pubg                              ← Custom scheme
https://sl-gaming-shop.store/game/mlbb          ← Web URL
https://sl-gaming-shop.store/game/pubg          ← Web URL
```

### Parsing Examples
```javascript
// Parse game ID from different URLs
const parseGameId = (url) => {
  const uri = new URL(url);
  
  if (uri.protocol === 'g2bulk:') {
    // g2bulk://game/mlbb → "mlbb"
    return uri.pathname.split('/').pop();
  } else {
    // https://sl-gaming-shop.store/game/mlbb → "mlbb"
    return uri.pathname.split('/').pop();
  }
};
```

## Production Configuration

### 1. Update Play Store Listing
- Add deep link support in app description
- Configure Digital Asset Links

### 2. Digital Asset Links (assetlinks.json)

Create file at: `https://sl-gaming-shop.store/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.g2bulk.gamingshop",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

Get SHA256:
```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-alias
```

### 3. Update Environment Variables

`.env`:
```env
FRONTEND_URL=https://sl-gaming-shop.store
MOBILE_DEEP_LINK_SCHEME=g2bulk
ANDROID_PACKAGE_NAME=com.g2bulk.gamingshop
PLAY_STORE_URL=https://play.google.com/store/apps/details?id=com.g2bulk.gamingshop
```

## Marketing Use Cases

### 1. Social Media Sharing
```
Share on Facebook, Twitter, Instagram:
"Check out Mobile Legends on G2Bulk! 🎮"
Link: https://sl-gaming-shop.store/game/mlbb
```

### 2. QR Code Posters
```
Print QR codes for:
- Store displays
- Gaming cafes
- Events
- Promotional materials
```

### 3. Push Notifications
```
Send notification with deep link:
"Mobile Legends diamonds on sale! Tap to buy now"
Link: g2bulk://game/mlbb
```

### 4. Email Campaigns
```
Email with button:
"View Game" → https://sl-gaming-shop.store/game/mlbb
```

## Error Handling

```javascript
// Check if deep link is valid
router.get('/game/:gameId', async (req, res) => {
  const { gameId } = req.params;
  
  // Validate game exists in database
  const game = await Product.findOne({ 
    'game.code': gameId,
    status: 'active'
  });
  
  if (!game) {
    return res.status(404).send(`
      <h1>Game Not Found</h1>
      <p>The game "${gameId}" is not available.</p>
      <a href="https://sl-gaming-shop.store">Browse All Games</a>
    `);
  }
  
  // Continue with deep link logic...
});
```

## Analytics Tracking

```javascript
// Track deep link usage
router.get('/game/:gameId', async (req, res) => {
  const { gameId } = req.params;
  const userAgent = req.headers['user-agent'];
  const referer = req.headers['referer'];
  
  // Log analytics
  await Analytics.create({
    event: 'deep_link_opened',
    gameId,
    userAgent,
    referer,
    timestamp: new Date()
  });
  
  // Continue...
});
```

## Support & Troubleshooting

### Common Issues

**App doesn't open:**
- Check if deep link scheme matches AndroidManifest
- Verify app is installed
- Test with ADB command

**Web fallback not working:**
- Check if URL is correct
- Verify server is accessible

**Play Store link wrong:**
- Update package name in code
- Verify Play Store URL

### Debug Commands

```bash
# View intent filters
adb shell dumpsys package com.g2bulk.gamingshop | grep -A 5 "android.intent.action.VIEW"

# Test deep link
adb shell am start -a android.intent.action.VIEW -d "g2bulk://game/test"

# View app info
adb shell pm list packages | grep g2bulk
```
