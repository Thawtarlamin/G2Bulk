const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductByKey,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
  .get(getAllProducts)
  .post(protect, admin, createProduct);

router.get('/key/:key', getProductByKey);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
