const express = require('express');
const router = express.Router();

// @desc    Deep link handler for game routing
// @route   GET /game/:gameId
// @access  Public
router.get('/game/:gameId', (req, res) => {
  const { gameId } = req.params;
  const userAgent = req.headers['user-agent'] || '';
  
  // Detect device type
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  
  // Deep links
  const deepLink = 'g2bulk://game/' + gameId;
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.g2bulk.gamingshop';
  const appStoreUrl = 'https://apps.apple.com/app/g2bulk-gaming-shop/id123456789';
  const webFallback = 'https://sl-gaming-shop.store/products/' + gameId;
  
  if (isAndroid) {
    res.send(generateHTML(deepLink, playStoreUrl, webFallback, 'Play Store'));
  } else if (isIOS) {
    res.send(generateHTML(deepLink, appStoreUrl, webFallback, 'App Store'));
  } else {
    res.redirect(webFallback);
  }
});

function generateHTML(deepLink, storeUrl, webUrl, storeName) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Opening G2Bulk Gaming Shop...</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 400px;
    }
    .logo {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    p {
      opacity: 0.9;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      padding: 15px 40px;
      background: white;
      color: #667eea;
      text-decoration: none;
      border-radius: 30px;
      font-weight: 600;
      margin: 10px;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: scale(1.05);
    }
    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-top: 3px solid white;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🎮</div>
    <h1>Opening G2Bulk Gaming Shop</h1>
    <div class="spinner"></div>
    <p>If the app doesn't open automatically...</p>
    <a href="${deepLink}" class="button" id="openApp">Open App</a>
    <a href="${storeUrl}" class="button">Download from ${storeName}</a>
    <a href="${webUrl}" class="button">Continue in Browser</a>
  </div>
  
  <script>
    window.location.href = '${deepLink}';
    
    setTimeout(function() {
      if (document.hidden || document.webkitHidden) {
        console.log('App opened successfully');
      }
    }, 2000);
    
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        console.log('User returned, app might not be installed');
      }
    });
  </script>
</body>
</html>`;
}

// @desc    Generate deep link for sharing
// @route   POST /game/link
// @access  Public
router.post('/game/link', (req, res) => {
  try {
    const { gameId, gameName } = req.body;
    
    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'Game ID is required'
      });
    }
    
    const deepLink = 'https://sl-gaming-shop.store/game/' + gameId;
    
    res.json({
      success: true,
      data: {
        deepLink,
        gameId,
        gameName,
        qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(deepLink)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
