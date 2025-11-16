const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductByKey,
  updateProduct,
  deleteProduct,
  syncProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getAllProducts);

router.post('/sync', protect, admin, syncProducts);

router.get('/key/:key', getProductByKey);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
