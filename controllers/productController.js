const Product = require('../models/Product');
const axios = require('axios');
const SystemConfig = require('../models/SystemConfig');
const { assignProductImages } = require('../utils/productImageMapper');

const PAYSELLER_BASE_URL = 'https://x.24payseller.com';

// @desc    Get all products
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' });
        
        // Add percentage calculation and sort items by price_mmk
        const productsWithPercentage = products.map(product => {
            const productObj = product.toObject();
            
            // Sort items by price_mmk (low to high)
            productObj.items = productObj.items
                .map(item => {
                    const percentage = item.original_price_thb > 0 
                        ? ((item.price_mmk / item.original_price_thb - 1) * 100).toFixed(2)
                        : 0;
                    return {
                        ...item,
                        markup_percentage: parseFloat(percentage)
                    };
                })
                .sort((a, b) => a.price_mmk - b.price_mmk);
            
            return productObj;
        });
        
        res.json(productsWithPercentage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product by key
// @route   GET /api/products/key/:key
exports.getProductByKey = async (req, res) => {
    try {
        const product = await Product.findOne({ key: req.params.key });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sync products from 24payseller
// @route   POST /api/products/sync
exports.syncProducts = async (req, res) => {
    try {
        // Get exchange rate and markup from database
        const exchangeRateConfig = await SystemConfig.findOne({ key: 'exchange_rate' });
        const markupRateConfig = await SystemConfig.findOne({ key: 'markup_rate' });
        
        const exchangeRate = exchangeRateConfig?.value || 125.79;
        const markupRate = markupRateConfig?.value || 1.10;

        const response = await axios.get(`${PAYSELLER_BASE_URL}/products/list`);
        
        const targetGames = [
            'mobile-legends-global',
            'mobile-legends-indonesia',
            'mobile-legends-malaysia',
            'mlbb-php-flashsale',
            'mobile-legends-singapore',
            'honor-of-kings-global',
            'magicchess-go-go',
            'pubg-mobile-global',
            'free-fire-i',
            'free-fire-v1',
            'free-fire-sg',
            'free-fire-my'
        ];

        const productsData = response.data;
        let syncedCount = 0;
        
        for (const productData of productsData) {
            if (targetGames.includes(productData.key)) {
                // Convert prices to MMK with markup
                const items = productData.items.map(item => ({
                    name: item.name,
                    sku: item.sku,
                    original_price_thb: parseFloat(item.price),
                    price_mmk: Math.round(parseFloat(item.price) * exchangeRate * markupRate)
                }));
               
                // Assign images to game and items
                console.log(`Processing images for ${productData.key}...`);
                const imageResults = await assignProductImages(productData.key, items);
                
                await Product.findOneAndUpdate(
                    { key: productData.key },
                    {
                        game: productData.name,
                        key: productData.key,
                        gameImage: imageResults.gameImage,
                        items: imageResults.items,
                        status: 'active'
                    },
                    { upsert: true, new: true }
                );

                syncedCount++;
                console.log(`✓ Synced ${productData.key} with images`);
            }
        }

        res.json({ 
          message: `Successfully synced ${syncedCount} products with images`,
          games: targetGames,
          syncedCount 
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
