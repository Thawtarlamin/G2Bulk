const { checkPlayerId: checkG2BulkPlayerId } = require('../utils/g2bulk');

// @desc    Check player ID validation
// @route   POST /api/validation/check-player
exports.checkPlayerId = async (req, res) => {
    try {
        const { game, user_id, server_id } = req.body;

        // Validation
        if (!game || !user_id) {
            return res.status(400).json({ 
                success: false,
                message: 'game and user_id are required' 
            });
        }

        console.log('Checking player ID:', { game, user_id, server_id });

        // Call G2Bulk API using helper
        const response = await checkG2BulkPlayerId({ 
            game, 
            user_id, 
            server_id 
        });

        console.log('G2Bulk response:', response);

        // Return success response
        return res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Player ID check error:', error.message);
        
        // Handle API errors
        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: 'Player ID validation failed',
                error: error.response.data
            });
        }

        // Handle network errors
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error: error.message
        });
    }
};
