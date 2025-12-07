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
        view_pager: []
      });
    }
    
    // Fetch active tags from Tag model
    const tags = await Tag.find({ status: 'active' }).select('name description');
    
    // Format response with tags
    const response = {
      ad_text: config.ad_text,
      tag: tags.map(tag => ({ tags: tag.name })),
      view_pager: config.view_pager,
      _id: config._id,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    };
    
    res.json({
      success: true,
      data: response
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
    const { ad_text, view_pager } = req.body;
    
    // Validation
    if (view_pager && !Array.isArray(view_pager)) {
      return res.status(400).json({
        success: false,
        message: 'view_pager must be an array'
      });
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
      config = await AppConfig.create({ ad_text, view_pager: [] });
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
