const Tag = require('../models/Tag');

// @desc    Get all tags
// @route   GET /api/tags
// @access  Public
exports.getAllTags = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }
    
    const tags = await Tag.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single tag by ID
// @route   GET /api/tags/:id
// @access  Public
exports.getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    res.json({
      success: true,
      data: tag
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new tag
// @route   POST /api/tags
// @access  Admin
exports.createTag = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }
    
    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: name.trim() });
    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag already exists'
      });
    }
    
    const tag = await Tag.create({
      name: name.trim(),
      description: description || '',
      status: status || 'active'
    });
    
    res.status(201).json({
      success: true,
      message: 'Tag created successfully',
      data: tag
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tag already exists'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Failed to create tag',
      error: error.message
    });
  }
};

// @desc    Update tag
// @route   PUT /api/tags/:id
// @access  Admin
exports.updateTag = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    // Update fields if provided
    if (name !== undefined) tag.name = name.trim();
    if (description !== undefined) tag.description = description;
    if (status !== undefined) tag.status = status;
    
    await tag.save();
    
    res.json({
      success: true,
      message: 'Tag updated successfully',
      data: tag
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tag name already exists'
      });
    }
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Failed to update tag',
      error: error.message
    });
  }
};

// @desc    Delete tag
// @route   DELETE /api/tags/:id
// @access  Admin
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    
    await tag.deleteOne();
    
    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Search tags by name
// @route   GET /api/tags/search/:query
// @access  Public
exports.searchTags = async (req, res) => {
  try {
    const { query } = req.params;
    
    const tags = await Tag.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ name: 1 });
    
    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
