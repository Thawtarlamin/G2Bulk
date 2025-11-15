const { downloadImage, generateFileName } = require('./imageHelper');

/**
 * Image mapping configuration for different games and items
 */
const IMAGE_MAPPINGS = {
  // Mobile Legends configurations
  'mobile-legends': {
    gameImage: 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg',
    itemRules: [
      {
        name: 'Twilight Pass',
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760334852631_fd44a9f4-9085-4bc6-87d5-52f1c00e8b0a.png'
      },
      {
        name: 'Weekly Diamond Pass',
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760334655808_8647a8cc-d3f4-40e5-bde7-78113e4e5188.png'
      },
      {
        maxAmount: 22,
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760334807315_98274110-b1a1-4ff4-af41-e53aaff27493.png'
      },
      {
        minAmount: 22,
        maxAmount: 112,
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335256868_78eca539-fb22-4e2b-b342-da44c87b5952.png'
      },
      {
        minAmount: 112,
        maxAmount: 336,
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335256241_d1722b74-7ea9-46c9-823e-5d20d74ddab9.png'
      },
      {
        minAmount: 336,
        maxAmount: 570,
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335255039_64278520-d0b8-4208-b14f-05d75b74f562.png'
      },
      {
        minAmount: 1000,
        maxAmount: 2000,
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335254754_8a7117c8-1479-4d86-b8ea-770d65481499.png'
      },
      {
        minAmount: 2000,
        maxAmount: 5000,
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335254471_f49d493e-eff7-46af-b686-4a7ad8a9d25e.png'
      },
      {
        minAmount: 5000,
        image: 'https://cdn1.codashop.com/images/106_5e7a01a7-89b9-4b13-a512-a3e72f63f0d1_product/1760335254187_df74642e-f6b4-42b3-9b40-e89c6988b660.png'
      }
    ]
  },
  
  // Magic Chess Go Go configurations
  'magicchess-go-go': {
    gameImage: 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/NEWmcgg.PNG',
    itemRules: [
      {
        name: 'Battle for Discounts',
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_product/1760678621523_270a96b6-af89-4b74-854d-6ee8ee52e28d.png'
      },
      {
        name: "Lukas's Battle Bounty",
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/6ef00df729858de9c10be72ee2c8d3f1.png'
      },
      {
        name: 'Weekly Pass',
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/50aaa23ffa956cdea7b85e5419c9f182.png'
      },
      {
        maxAmount: 10,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/ac5831b2d1f00ef06f82f67eec5ddfe2.png'
      },
      {
        minAmount: 10,
        maxAmount: 20,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/e265c28307ec069731d232ad8deaa8e1.png'
      },
      {
        minAmount: 10,
        maxAmount: 22,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/a102d4dd3af2c2b4e5735e1242d55ed6.png'
      },
      {
        minAmount: 22,
        maxAmount: 56,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/a102d4dd3af2c2b4e5735e1242d55ed6.png'
      },
      {
        minAmount: 56,
        maxAmount: 112,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/d82daa464259e33bb8a8bc47203c2a04.png'
      },
      {
        minAmount: 112,
        maxAmount: 223,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/d82daa464259e33bb8a8bc47203c2a04.png'
      },
      {
        minAmount: 223,
        maxAmount: 570,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/ee0ad04f84a047167782309906ce3c2a.png'
      },
      {
        minAmount: 570,
        maxAmount: 1163,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/2d5bab70628c4ddc9a74e7a8c6114195.png'
      },
      {
        minAmount: 1163,
        maxAmount: 2398,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/98e944d413859db664e72df177494ebf.png'
      },
      {
        minAmount: 2398,
        maxAmount: 6042,
        image: 'https://cdn1.codashop.com/images/2819_7773f6d6-034c-4f41-8314-19f0acc4063d_40ae905f33127e4e116de79607e55309_image/9b37c0abd7f6a56a7a74881aeb09b48e.png'
      }
    ]
  },
  
  // PUBG Mobile configurations
  'pubg-mobile-global': {
    gameImage: 'https://cdn.midasbuy.com/images/pubgm_app-icon_512x512%281%29.e9f7efc0.png',
    itemRules: [
      {
        minAmount: 60,
        maxAmount: 300,
        image: 'https://cdn.midasbuy.com/images/level1.cb11b2cd.png'
      },
      {
        minAmount: 300,
        maxAmount: 600,
        image: 'https://cdn.midasbuy.com/images/level2.f2b27a84.png'
      },
      {
        minAmount: 600,
        maxAmount: 1500,
        image: 'https://cdn.midasbuy.com/images/level3.6e2a3de7.png'
      },
      {
        minAmount: 1500,
        maxAmount: 3000,
        image: 'https://cdn.midasbuy.com/images/level5.5a6a7af6.png'
      },
      {
        minAmount: 3000,
        maxAmount: 6000,
        image: 'https://cdn.midasbuy.com/images/level6.03ebac0d.png'
      }
    ]
  },
  
  // Honor of Kings configurations
  'honor-of-kings-global': {
    gameImage: 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles-plain/Honor-of-Kings-Tile.png',
    itemRules: [
      {
        minAmount: 8,
        maxAmount: 32,
        image: 'https://cdn.midasbuy.com/images/1.329f2f33.png'
      },
      {
        minAmount: 32,
        maxAmount: 240,
        image: 'https://cdn.midasbuy.com/public/de7c91b8aa6a5f8f44c81b62b13034ee.png'
      },
      {
        minAmount: 240,
        maxAmount: 400,
        image: 'https://cdn.midasbuy.com/public/e24ecc8e4dceb69e56b63778d136ec26.png'
      },
      {
        minAmount: 400,
        maxAmount: 560,
        image: 'https://cdn.midasbuy.com/public/a709d0e2ee81aed1b5c05f36de6d6ca8.png'
      },
      {
        minAmount: 560,
        maxAmount: 1200,
        image: 'https://cdn.midasbuy.com/public/5df9b33de1d89c172d324d8415ed7888.png'
      },
      {
        minAmount: 1200,
        maxAmount: 2400,
        image: 'https://cdn.midasbuy.com/public/5e3f9c1c70d2af157b9c1c5a2c9b2d96.png'
      },
      {
        minAmount: 2400,
        maxAmount: 4000,
        image: 'https://cdn.midasbuy.com/public/20394d44dcd34949253863196976a5e4.png'
      },
      {
        minAmount: 4000,
        maxAmount: 8000,
        image: 'https://cdn.midasbuy.com/public/b90717b741b250577d8dd5c8b6317dac.png'
      }
    ]
  },
  
  // Free Fire configurations
  'free-fire': {
    gameImage: 'https://cdn1.codashop.com/S/content/mobile/images/product-tiles/free_fire_new_tile.png',
    itemRules: [
      {
        minAmount: 5,
        image: 'https://cdn1.codashop.com/S/content/common/images/denom-image/GARENA_SHELLS/GARENA_Shells.png'
      }
    ]
  }
};

/**
 * Extract numeric value from item name (for diamonds, UC, etc.)
 */
const extractNumericValue = (itemName) => {
  // Try to find numbers in the name
  const match = itemName.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  return 0;
};

/**
 * Check if item name matches special names (passes, etc.)
 */
const matchesSpecialName = (itemName, ruleName) => {
  const normalizedItemName = itemName.toLowerCase().trim();
  const normalizedRuleName = ruleName.toLowerCase().trim();
  return normalizedItemName.includes(normalizedRuleName) || normalizedRuleName.includes(normalizedItemName);
};

/**
 * Get image URL for a specific item based on rules
 */
const getItemImage = (gameKey, itemName) => {
  // Determine game type from key
  let gameType = null;
  if (gameKey.includes('mobile-legends') || gameKey.includes('mlbb')) {
    gameType = 'mobile-legends';
  } else if (gameKey === 'magicchess-go-go') {
    gameType = 'magicchess-go-go';
  } else if (gameKey === 'pubg-mobile-global') {
    gameType = 'pubg-mobile-global';
  } else if (gameKey === 'honor-of-kings-global') {
    gameType = 'honor-of-kings-global';
  } else if (gameKey.includes('free-fire')) {
    gameType = 'free-fire';
  }

  if (!gameType || !IMAGE_MAPPINGS[gameType]) {
    return null;
  }

  const config = IMAGE_MAPPINGS[gameType];
  const itemValue = extractNumericValue(itemName);

  // First, check for special name matches
  for (const rule of config.itemRules) {
    if (rule.name && matchesSpecialName(itemName, rule.name)) {
      return rule.image;
    }
  }

  // Then check numeric ranges
  for (const rule of config.itemRules) {
    if (rule.name) continue; // Skip special name rules

    const hasMin = rule.minAmount !== undefined;
    const hasMax = rule.maxAmount !== undefined;

    if (hasMin && hasMax) {
      if (itemValue >= rule.minAmount && itemValue < rule.maxAmount) {
        return rule.image;
      }
    } else if (hasMin && !hasMax) {
      if (itemValue >= rule.minAmount) {
        return rule.image;
      }
    } else if (!hasMin && hasMax) {
      if (itemValue < rule.maxAmount) {
        return rule.image;
      }
    }
  }

  return null;
};

/**
 * Get game image for a specific game key
 */
const getGameImage = (gameKey) => {
  let gameType = null;
  if (gameKey.includes('mobile-legends') || gameKey.includes('mlbb')) {
    gameType = 'mobile-legends';
  } else if (gameKey === 'magicchess-go-go') {
    gameType = 'magicchess-go-go';
  } else if (gameKey === 'pubg-mobile-global') {
    gameType = 'pubg-mobile-global';
  } else if (gameKey === 'honor-of-kings-global') {
    gameType = 'honor-of-kings-global';
  } else if (gameKey.includes('free-fire')) {
    gameType = 'free-fire';
  }

  if (!gameType || !IMAGE_MAPPINGS[gameType]) {
    return null;
  }

  return IMAGE_MAPPINGS[gameType].gameImage;
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
      results.gameImage = await downloadImage(gameImageUrl, fileName);
    }

    // Download item images
    for (const item of items) {
      const itemImageUrl = getItemImage(gameKey, item.name);
      let itemImagePath = null;
      
      if (itemImageUrl) {
        const fileName = generateFileName(itemImageUrl, `item_${gameKey}_`);
        itemImagePath = await downloadImage(itemImageUrl, fileName);
      }

      results.items.push({
        ...item,
        image: itemImagePath
      });
    }
  } catch (error) {
    console.error(`Error assigning images for ${gameKey}:`, error.message);
  }

  return results;
};

module.exports = {
  assignProductImages,
  getGameImage,
  getItemImage,
  extractNumericValue
};
