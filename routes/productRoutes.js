const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductByKey,
  getProductsByTag,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getAllProducts)
  .post(protect, admin, upload.single('image'), createProduct);

router.get('/key/:key', getProductByKey);
router.get('/tag/:tag', getProductsByTag);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, upload.single('image'), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
