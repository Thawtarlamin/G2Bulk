const AppConfig = require('../models/AppConfig');
const Tag = require('../models/Tag');
const { uploadBuffer, cloudinary } = require('../utils/cloudinary');

// @desc    Get app config (or create default if not exists)
// @route   GET /api/app-config
// @access  Public
exports.getAppConfig = async (req, res) => {
  try {
    let config = await AppConfig.findOne();
    
    // Create default config if not exists
    if (!config) {
      config = await AppConfig.create({
        ad_text: '',
        tag: [],
        view_pager: []
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update or create app config
// @route   POST /api/app-config
// @access  Admin
exports.upsertAppConfig = async (req, res) => {
  try {
    const { ad_text, tag, view_pager } = req.body;
    
    // Validation
    if (tag && !Array.isArray(tag)) {
      return res.status(400).json({
        success: false,
        message: 'tag must be an array'
      });
    }
    
    if (view_pager && !Array.isArray(view_pager)) {
      return res.status(400).json({
        success: false,
        message: 'view_pager must be an array'
      });
    }
    
    // Validate tags exist in Tag database
    if (tag && Array.isArray(tag)) {
      for (const tagItem of tag) {
        if (tagItem.tags) {
          const tagExists = await Tag.findOne({ name: tagItem.tags, status: 'active' });
          if (!tagExists) {
            return res.status(400).json({
              success: false,
              message: `Tag '${tagItem.tags}' does not exist or is inactive. Please create the tag first.`
            });
          }
        }
      }
    }
    
    // If files uploaded (multiple images), upload to Cloudinary
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          const result = await uploadBuffer(file.buffer, { 
            folder: 'g2bulk/view-pager' 
          });
          uploadedImages.push({ image: result.secure_url });
        }
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload images to Cloudinary',
          error: err.message
        });
      }
    }
    
    // Find existing config or create new
    let config = await AppConfig.findOne();
    
    if (config) {
      // Update existing
      if (ad_text !== undefined) config.ad_text = ad_text;
      if (tag !== undefined) config.tag = tag;
      if (view_pager !== undefined) config.view_pager = view_pager;
      
      // If new images uploaded, append or replace
      if (uploadedImages.length > 0) {
        if (req.body.replace_images === 'true') {
          config.view_pager = uploadedImages;
        } else {
          config.view_pager = [...config.view_pager, ...uploadedImages];
        }
      }
      
      await config.save();
    } else {
      // Create new
      config = await AppConfig.create({
        ad_text: ad_text || '',
        tag: tag || [],
        view_pager: uploadedImages.length > 0 ? uploadedImages : (view_pager || [])
      });
    }
    
    res.json({
      success: true,
      message: 'App config saved successfully',
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to save config',
      error: error.message
    });
  }
};

// @desc    Update ad_text only
// @route   PUT /api/app-config/ad-text
// @access  Admin
exports.updateAdText = async (req, res) => {
  try {
    const { ad_text } = req.body;
    
    if (!ad_text) {
      return res.status(400).json({
        success: false,
        message: 'ad_text is required'
      });
    }
    
    let config = await AppConfig.findOne();
    
    if (!config) {
      config = await AppConfig.create({ ad_text, tag: [], view_pager: [] });
    } else {
      config.ad_text = ad_text;
      await config.save();
    }
    
    res.json({
      success: true,
      message: 'Ad text updated successfully',
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update ad text',
      error: error.message
    });
  }
};

// @desc    Add tag
// @route   POST /api/app-config/tags
// @access  Admin
exports.addTag = async (req, res) => {
  try {
    const { tags } = req.body;
    
    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'tags is required'
      });
    }
    
    // Validate tag exists in Tag database
    const tagExists = await Tag.findOne({ name: tags, status: 'active' });
    if (!tagExists) {
      return res.status(400).json({
        success: false,
        message: `Tag '${tags}' does not exist or is inactive. Please create the tag first.`
      });
    }
    
    let config = await AppConfig.findOne();
    
    if (!config) {
      config = await AppConfig.create({
        ad_text: '',
        tag: [{ tags }],
        view_pager: []
      });
    } else {
      config.tag.push({ tags });
      await config.save();
    }
    
    res.json({
      success: true,
      message: 'Tag added successfully',
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add tag',
      error: error.message
    });
  }
};

// @desc    Remove tag by index
// @route   DELETE /api/app-config/tags/:index
// @access  Admin
exports.removeTag = async (req, res) => {
  try {
    const { index } = req.params;
    
    const config = await AppConfig.findOne();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Config not found'
      });
    }
    
    if (index < 0 || index >= config.tag.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid index'
      });
    }
    
    config.tag.splice(index, 1);
    await config.save();
    
    res.json({
      success: true,
      message: 'Tag removed successfully',
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to remove tag',
      error: error.message
    });
  }
};

// @desc    Add view pager image
// @route   POST /api/app-config/view-pager
// @access  Admin
exports.addViewPager = async (req, res) => {
  try {
    let imageUrl;
    
    // If file uploaded, upload to Cloudinary
    if (req.file) {
      try {
        const result = await uploadBuffer(req.file.buffer, { 
          folder: 'g2bulk/view-pager' 
        });
        imageUrl = result.secure_url;
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary',
          error: err.message
        });
      }
    } else if (req.body.image) {
      // If image URL provided in body
      imageUrl = req.body.image;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image file or image URL is required'
      });
    }
    
    let config = await AppConfig.findOne();
    
    if (!config) {
      config = await AppConfig.create({
        ad_text: '',
        tag: [],
        view_pager: [{ image: imageUrl }]
      });
    } else {
      config.view_pager.push({ image: imageUrl });
      await config.save();
    }
    
    res.json({
      success: true,
      message: 'View pager image added successfully',
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add view pager image',
      error: error.message
    });
  }
};

// @desc    Remove view pager image by index
// @route   DELETE /api/app-config/view-pager/:index
// @access  Admin
exports.removeViewPager = async (req, res) => {
  try {
    const { index } = req.params;
    
    const config = await AppConfig.findOne();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Config not found'
      });
    }
    
    if (index < 0 || index >= config.view_pager.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid index'
      });
    }
    
    config.view_pager.splice(index, 1);
    await config.save();
    
    res.json({
      success: true,
      message: 'View pager image removed successfully',
      data: config
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to remove view pager image',
      error: error.message
    });
  }
};

// @desc    Delete entire app config
// @route   DELETE /api/app-config
// @access  Admin
exports.deleteAppConfig = async (req, res) => {
  try {
    const config = await AppConfig.findOne();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Config not found'
      });
    }
    
    await config.deleteOne();
    
    res.json({
      success: true,
      message: 'App config deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
