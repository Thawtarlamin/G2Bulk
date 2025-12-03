const Product = require('../models/Product');
const SystemConfig = require('../models/SystemConfig');

// @desc    Get all products
// @route   GET /api/products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' });
        
        // Sort catalogues by amount (low to high)
        const productsWithSortedCatalogues = products.map(product => {
            const productObj = product.toObject();
            
            if (productObj.catalogues && productObj.catalogues.length > 0) {
                productObj.catalogues = productObj.catalogues.sort((a, b) => a.amount - b.amount);
            }
            
            return productObj;
        });
        
        res.json(productsWithSortedCatalogues);
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
        const product = await Product.findOne({ 'game.code': req.params.key });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const productObj = product.toObject();
        
        // Sort catalogues by amount (low to high)
        if (productObj.catalogues && productObj.catalogues.length > 0) {
            productObj.catalogues = productObj.catalogues.sort((a, b) => a.amount - b.amount);
        }

        res.json(productObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create product manually
// @route   POST /api/products
exports.createProduct = async (req, res) => {
    try {
        const { game, catalogues, tag } = req.body;

        // Validate required fields
        if (!game || !game.code || !game.name || !game.image_url) {
            return res.status(400).json({ 
                message: 'Game object with code, name, and image_url is required' 
            });
        }

        if (!catalogues || !Array.isArray(catalogues) || catalogues.length === 0) {
            return res.status(400).json({ 
                message: 'Catalogues array is required and must not be empty' 
            });
        }

        // Check if product with same game code already exists
        const existingProduct = await Product.findOne({ 'game.code': game.code });
        if (existingProduct) {
            return res.status(400).json({ 
                message: `Product with game code '${game.code}' already exists` 
            });
        }

        // Create product
        const product = await Product.create({
            game: {
                code: game.code,
                name: game.name,
                image_url: game.image_url
            },
            catalogues: catalogues.map((cat, index) => ({
                id: cat.id || index + 1,
                name: cat.name,
                amount: cat.amount
            })),
            tag: tag || 'game',
            status: 'active'
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
    try {
        const { game, catalogues, tag, status } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update game object
        if (game) {
            product.game = {
                code: game.code || product.game.code,
                name: game.name || product.game.name,
                image_url: game.image_url || product.game.image_url
            };
        }

        // Update catalogues
        if (catalogues && Array.isArray(catalogues)) {
            product.catalogues = catalogues.map((cat, index) => ({
                id: cat.id || index + 1,
                name: cat.name,
                amount: cat.amount
            }));
        }

        // Update tag and status
        if (tag) product.tag = tag;
        if (status) product.status = status;

        await product.save();
        
        res.json({
            message: 'Product updated successfully',
            product
        });
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