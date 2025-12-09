const Percentage = require('../models/Percentage');

// @desc    Get current percentage
// @route   GET /api/percentage
exports.getPercentage = async (req, res) => {
    try {
        let percentage = await Percentage.findOne({ isActive: true });
        
        if (!percentage) {
            // Create default percentage if none exists
            percentage = await Percentage.create({
                value: 10,
                description: 'Product markup percentage',
                isActive: true
            });
        }
        
        res.json({
            success: true,
            data: percentage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update percentage
// @route   PUT /api/percentage
exports.updatePercentage = async (req, res) => {
    try {
        const { value, description } = req.body;
        
        if (value === undefined || value < 0 || value > 100) {
            return res.status(400).json({
                success: false,
                message: 'Percentage value must be between 0 and 100'
            });
        }
        
        let percentage = await Percentage.findOne({ isActive: true });
        
        if (!percentage) {
            // Create new if none exists
            percentage = await Percentage.create({
                value,
                description: description || 'Product markup percentage',
                isActive: true
            });
        } else {
            // Update existing
            percentage.value = value;
            if (description) {
                percentage.description = description;
            }
            await percentage.save();
        }
        
        res.json({
            success: true,
            message: 'Percentage updated successfully',
            data: percentage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
