const SystemConfig = require('../models/SystemConfig');

// @desc    Get all system configs
// @route   GET /api/system-config
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await SystemConfig.find();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get config by key
// @route   GET /api/system-config/:key
exports.getConfigByKey = async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ key: req.params.key });
    if (!config) {
      return res.status(404).json({ message: 'Config not found' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update config
// @route   POST /api/system-config
exports.upsertConfig = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    const config = await SystemConfig.findOneAndUpdate(
      { key },
      { key, value, description },
      { upsert: true, new: true, runValidators: true }
    );

    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update config value
// @route   PUT /api/system-config/:key
exports.updateConfig = async (req, res) => {
  try {
    const { value, description } = req.body;

    const config = await SystemConfig.findOneAndUpdate(
      { key: req.params.key },
      { value, description },
      { new: true, runValidators: true }
    );

    if (!config) {
      return res.status(404).json({ message: 'Config not found' });
    }

    res.json(config);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete config
// @route   DELETE /api/system-config/:key
exports.deleteConfig = async (req, res) => {
  try {
    const config = await SystemConfig.findOneAndDelete({ key: req.params.key });

    if (!config) {
      return res.status(404).json({ message: 'Config not found' });
    }

    res.json({ message: 'Config deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initialize default configs
// @route   POST /api/system-config/init
exports.initializeConfigs = async (req, res) => {
  try {
    const defaultConfigs = [
      {
        key: 'exchange_rate',
        value: 125.79,
        description: 'THB to MMK exchange rate (1 THB = X MMK)'
      },
      {
        key: 'markup_rate',
        value: 1.10,
        description: 'Product price markup rate (e.g., 1.10 = 10% markup)'
      }
    ];

    for (const configData of defaultConfigs) {
      await SystemConfig.findOneAndUpdate(
        { key: configData.key },
        configData,
        { upsert: true, new: true }
      );
    }

    const configs = await SystemConfig.find();
    res.json({
      message: 'System configs initialized successfully',
      configs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
