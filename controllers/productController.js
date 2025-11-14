const Product = require('../models/Product');
const axios = require('axios');

// @desc    Get all products
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const { status, game } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (game) filter.game = new RegExp(game, 'i');

        const products = await Product.find(filter);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product
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

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
    try {
        const { game, key, items, inputs, status } = req.body;

        const productExists = await Product.findOne({ key });
        if (productExists) {
            return res.status(400).json({ message: 'Product already exists' });
        }

        const product = await Product.create({
            game,
            key,
            items,
            inputs,
            status
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Sync products from 24payseller API
// @route   POST /api/products/sync
exports.syncProducts = async (req, res) => {
    try {
        const SystemConfig = require('../models/SystemConfig');
        
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://x.24payseller.com/products/list',
            headers: {}
        };
        const response = await axios.request(config);
        
        // Get exchange rate and markup from database
        const exchangeRateConfig = await SystemConfig.findOne({ key: 'exchange_rate' });
        const markupRateConfig = await SystemConfig.findOne({ key: 'markup_rate' });
        
        const exchangeRate = exchangeRateConfig?.value || 125.79;
        const markupRate = markupRateConfig?.value || 1.10;

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
                // Convert prices to MMK with 10% markup
                const items = productData.items.map(item => ({
                    name: item.name,
                    sku: item.sku,
                    original_price_thb: parseFloat(item.price),
                    price_mmk: Math.round(parseFloat(item.price) * exchangeRate * markupRate)
                }));
               
                await Product.findOneAndUpdate(
                    { key: productData.key },
                    {
                        game: productData.name,
                        key: productData.key,
                        items,
                        // inputs,
                        status: 'active'
                    },
                    { upsert: true, new: true }
                );

                syncedCount++;
            }
        }

        res.json({ 
          message: `Successfully synced ${syncedCount} products`,
          games: targetGames 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
