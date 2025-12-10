const axios = require('axios');
const Product = require('../models/Product');
const { uploadFromUrl } = require('./cloudinary');

/**
 * Fetch game input fields from G2Bulk API
 * @param {string} gameCode - Game code (e.g., 'mlbb', 'freefire', etc.)
 * @returns {Promise<Object>} Game input fields data
 */
async function fetchG2BulkGameFields(gameCode) {
  try {
    const response = await axios.post('https://api.g2bulk.com/v1/games/fields', {
      game: gameCode
    });
    
    if (response.data && response.data.code === '200') {
      return {
        success: true,
        fields: response.data.info.fields || [],
        notes: response.data.info.notes || null
      };
    }
    
    return {
      success: false,
      message: 'Failed to fetch game fields'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fetch game catalogue from G2Bulk API
 * @param {string} gameCode - Game code (e.g., 'mlbb', 'freefire', etc.)
 * @returns {Promise<Object>} Game catalogue data
 */
async function fetchG2BulkCatalogue(gameCode) {
  try {
    const response = await axios.get(`https://api.g2bulk.com/v1/games/${gameCode}/catalogue`);
    
    if (response.data && response.data.success) {
      return {
        success: true,
        game: response.data.game,
        catalogues: response.data.catalogues
      };
    }
    
    return {
      success: false,
      message: 'Failed to fetch catalogue'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create or update product from G2Bulk catalogue
 * @param {string} gameCode - Game code
 * @param {string} tag - Product tag
 * @returns {Promise<Object>} Result
 */
async function syncProductFromG2Bulk(gameCode, tag) {
  try {
    console.log(`\n🔄 Fetching ${gameCode.toUpperCase()} catalogue from G2Bulk...`);
    
    const catalogueData = await fetchG2BulkCatalogue(gameCode);
    
    if (!catalogueData.success) {
      return {
        success: false,
        message: catalogueData.message || catalogueData.error
      };
    }
    
    const { game, catalogues } = catalogueData;
    
    console.log(`✅ Found ${catalogues.length} items in catalogue`);
    
    // Upload game image to Cloudinary
    console.log(`📤 Uploading ${game.name} image to Cloudinary...`);
    try {
      const cloudinaryResult = await uploadFromUrl(game.image_url, {
        folder: 'g2bulk/products',
        public_id: `${game.code}_${Date.now()}`,
        overwrite: true
      });
      
      // Update game image URL with Cloudinary URL
      game.image_url = cloudinaryResult.secure_url;
      console.log(`✅ Image uploaded successfully`);
    } catch (uploadError) {
      console.error(`⚠️ Failed to upload image to Cloudinary: ${uploadError.message}`);
      console.log(`ℹ️ Using original image URL`);
    }
    
    // Check if product already exists
    const existingProduct = await Product.findOne({ 'game.code': game.code });
    
    if (existingProduct) {
      // Update existing product
      existingProduct.game = game;
      existingProduct.catalogues = catalogues;
      existingProduct.tag = tag;
      existingProduct.status = 'active';
      
      await existingProduct.save();
      
      console.log(`✅ Product updated: ${game.name}`);
      
      return {
        success: true,
        action: 'updated',
        product: existingProduct
      };
    } else {
      // Create new product
      const newProduct = new Product({
        game: game,
        catalogues: catalogues,
        tag: tag,
        status: 'active'
      });
      
      await newProduct.save();
      
      console.log(`✅ Product created: ${game.name}`);
      
      return {
        success: true,
        action: 'created',
        product: newProduct
      };
    }
  } catch (error) {
    console.error(`❌ Error syncing product:`, error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Sync multiple games from G2Bulk
 * @param {Array} games - Array of {gameCode, tag}
 * @returns {Promise<Object>} Results
 */
async function syncMultipleProducts(games) {
  const results = {
    success: [],
    failed: []
  };
  
  console.log(`\n📦 Syncing ${games.length} products from G2Bulk...\n`);
  
  for (const game of games) {
    const result = await syncProductFromG2Bulk(game.gameCode, game.tag);
    
    if (result.success) {
      results.success.push({
        gameCode: game.gameCode,
        action: result.action,
        productId: result.product._id
      });
    } else {
      results.failed.push({
        gameCode: game.gameCode,
        error: result.error || result.message
      });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ Sync completed:`);
  console.log(`   - Success: ${results.success.length}`);
  console.log(`   - Failed: ${results.failed.length}`);
  
  return results;
}

module.exports = {
  fetchG2BulkGameFields,
  fetchG2BulkCatalogue,
  syncProductFromG2Bulk,
  syncMultipleProducts
};
