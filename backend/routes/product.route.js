const express = require('express');
const router = express.Router();
const {addProduct, getProducts, getProductsBySlug, updateProduct, deleteProduct, reorderProducts} = require('../controllers/product.controllar');
const {authanticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middlewares');
const upload = require('../middlewares/uploud.middlewares');

router.get('/', getProducts);
router.patch('/reorder', authanticate, authorize('admin'), reorderProducts); // Must be before /:slug or /:id
router.get('/:slug', getProductsBySlug);
router.post('/', authanticate, authorize('admin'), upload.single('img'), addProduct);
router.put('/:id', authanticate, authorize('admin'), upload.single('img'), updateProduct);
router.delete('/:id', authanticate, authorize('admin'), deleteProduct);

module.exports = router;