const { downloadImage, generateFileName } = require('./imageHelper');

/**
 * Image mapping configuration for different games
 */
const IMAGE_MAPPINGS = {
  'mobile-legends': 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg',
  'magicchess-go-go': 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/NEWmcgg.PNG',
  'pubg-mobile-global': 'https://cdn.midasbuy.com/images/pubgm_app-icon_512x512%281%29.e9f7efc0.png',
  'honor-of-kings-global': 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles-plain/Honor-of-Kings-Tile.png',
  'free-fire': 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/free_fire_new_tile.png'
};

/**
 * Get game image for a specific game key
 */
const getGameImage = (gameKey) => {
  // Check for Mobile Legends variants
  if (gameKey.includes('mobile-legends') || gameKey.includes('mlbb')) {
    return IMAGE_MAPPINGS['mobile-legends'];
  }
  
  // Check for Free Fire variants
  if (gameKey.includes('free-fire')) {
    return IMAGE_MAPPINGS['free-fire'];
  }
  
  // Direct match
  return IMAGE_MAPPINGS[gameKey] || null;
};

/**
 * Download and assign images for a product
 */
const assignProductImages = async (gameKey, items) => {
  const results = {
    gameImage: null,
    items: []
  };

  try {
    // Download game image
    const gameImageUrl = getGameImage(gameKey);
    if (gameImageUrl) {
      const fileName = generateFileName(gameImageUrl, `game_${gameKey}_`);
      const localPath = await downloadImage(gameImageUrl, fileName);
      results.gameImage = localPath;
    }

    // Return items without individual images
    results.items = items.map(item => ({
      ...item,
      image: null
    }));
  } catch (error) {
    console.error(`Error assigning images for ${gameKey}:`, error.message);
  }

  return results;
};

module.exports = {
  assignProductImages,
  getGameImage
};
