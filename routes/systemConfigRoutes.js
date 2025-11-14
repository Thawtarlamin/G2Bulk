const express = require('express');
const router = express.Router();
const {
  getAllConfigs,
  getConfigByKey,
  upsertConfig,
  updateConfig,
  deleteConfig,
  initializeConfigs
} = require('../controllers/systemConfigController');
const { protect, admin } = require('../middleware/auth');

// All routes require admin access
router.use(protect, admin);

router.get('/', getAllConfigs);
router.get('/:key', getConfigByKey);
router.post('/', upsertConfig);
router.post('/init', initializeConfigs);
router.put('/:key', updateConfig);
router.delete('/:key', deleteConfig);

module.exports = router;
