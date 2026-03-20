const express = require('express');
const router = express.Router();
const {
    getProducts, getProduct, createProduct,
    updateProduct, deleteProduct, toggleProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authorize('admin', 'manager'), createProduct);
router.put('/:id', authorize('admin', 'manager'), updateProduct);
router.delete('/:id', authorize('manager'), deleteProduct);
router.patch('/:id/toggle', authorize('admin', 'manager'), toggleProduct);

module.exports = router;
