const Product = require('../models/Product');
const Tag = require('../models/Tag');
const { uploadBuffer, cloudinary } = require('../utils/cloudinary');

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

        // If an image file is uploaded, upload it to Cloudinary and set game.image_url
        if (req.file) {
            try {
                const result = await uploadBuffer(req.file.buffer, { folder: 'g2bulk/products' });
                // Ensure game object exists
                if (!req.body.game) req.body.game = {};
                req.body.game.image_url = result.secure_url;
            } catch (err) {
                return res.status(500).json({ message: 'Failed to upload product image', error: err.message });
            }
        }

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

        // Validate tag exists in database
        if (tag) {
            const tagExists = await Tag.findOne({ name: tag, status: 'active' });
            if (!tagExists) {
                return res.status(400).json({ 
                    message: `Tag '${tag}' does not exist or is inactive. Please create the tag first.` 
                });
            }
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

        // If a new image file is uploaded, upload to Cloudinary and set URL
        if (req.file) {
            try {
                const result = await uploadBuffer(req.file.buffer, { folder: 'g2bulk/products' });
                // ensure game object
                if (!req.body.game) req.body.game = {};
                req.body.game.image_url = result.secure_url;
            } catch (err) {
                return res.status(500).json({ message: 'Failed to upload product image', error: err.message });
            }
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

        // Validate tag exists in database before updating
        if (tag) {
            const tagExists = await Tag.findOne({ name: tag, status: 'active' });
            if (!tagExists) {
                return res.status(400).json({ 
                    message: `Tag '${tag}' does not exist or is inactive. Please create the tag first.` 
                });
            }
            product.tag = tag;
        }

        // Update tag and status
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

// @desc    Get products by tag
// @route   GET /api/products/tag/:tag
exports.getProductsByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        
        const products = await Product.find({ 
            tag: tag,
            status: 'active' 
        });
        
        // Sort catalogues by amount (low to high)
        const productsWithSortedCatalogues = products.map(product => {
            const productObj = product.toObject();
            
            if (productObj.catalogues && productObj.catalogues.length > 0) {
                productObj.catalogues = productObj.catalogues.sort((a, b) => a.amount - b.amount);
            }
            
            return productObj;
        });
        
        res.json({
            success: true,
            count: productsWithSortedCatalogues.length,
            data: productsWithSortedCatalogues
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
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

        // Attempt to delete Cloudinary image if present
        try {
            const imageUrl = product.game && product.game.image_url ? product.game.image_url : null;
            if (imageUrl && imageUrl.includes('res.cloudinary.com')) {
                // Extract public_id from URL: /upload/(v1234/)?<public_id>.<ext>
                const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+?)\.[^/.]+$/);
                if (match && match[1]) {
                    const publicId = match[1];
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
                }
            }
        } catch (err) {
            // Log and continue - don't block product deletion on Cloudinary errors
            console.error('Failed to remove product image from Cloudinary:', err.message || err);
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};