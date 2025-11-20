const axios = require('axios');

const G2BULK_API_URL = 'https://api.g2bulk.com/v1';

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

        // Prepare request body
        const bodyData = { game, user_id };
        if (server_id) {
            bodyData.server_id = server_id;
        }

        // Call G2Bulk API
        const response = await axios.post(
            `${G2BULK_API_URL}/games/checkPlayerId`,
            bodyData,
            { 
                headers: { 
                    'Content-Type': 'application/json'
                },
                timeout: 15000
            }
        );

        console.log('G2Bulk response:', response.data);

        // Return success response
        return res.json({
            success: true,
            data: response.data
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

// @desc    Get supported games list
// @route   GET /api/validation/games
exports.getSupportedGames = async (req, res) => {
    try {
        // List of games that support player ID validation
        const supportedGames = [
            {
                key: 'mobile-legends',
                name: 'Mobile Legends',
                requiresServer: true,
                userIdLabel: 'User ID',
                serverIdLabel: 'Zone ID'
            },
            {
                key: 'free-fire',
                name: 'Free Fire',
                requiresServer: false,
                userIdLabel: 'Player ID'
            },
            {
                key: 'pubg-mobile',
                name: 'PUBG Mobile',
                requiresServer: false,
                userIdLabel: 'Player ID'
            },
            {
                key: 'honor-of-kings',
                name: 'Honor of Kings',
                requiresServer: true,
                userIdLabel: 'Role ID',
                serverIdLabel: 'Server ID'
            }
        ];

        res.json({
            success: true,
            games: supportedGames
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
