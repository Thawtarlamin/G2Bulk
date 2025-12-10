const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductByKey,
  getProductsByTag,
  createProduct,
  updateProduct,
  deleteProduct,
  syncFromG2Bulk,
  syncMultipleFromG2Bulk,
  getGameFields
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getAllProducts)
  .post(protect, admin, upload.single('image'), createProduct);

router.post('/sync', protect, admin, syncFromG2Bulk);
router.post('/sync-multiple', protect, admin, syncMultipleFromG2Bulk);
router.get('/fields/:gameCode', getGameFields);

router.get('/key/:key', getProductByKey);
router.get('/tag/:tag', getProductsByTag);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
