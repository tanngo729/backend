// backend/routes/admin/productAdminRoutes.js
const express = require('express');
const router = express.Router();
const productAdminController = require('../../controllers/admin/ProductAdminController');
const upload = require('../../middleware/multer');

// Add admin product routes here later
router.get('', productAdminController.getProductListForAdmin);
router.put('/:id/status', productAdminController.updateProductStatus);
router.delete('/batch', productAdminController.batchDeleteProducts);
router.delete('/:id', productAdminController.deleteProduct);
router.post('', upload.single('imageFile'), productAdminController.createProduct);
router.put('/:id/position', productAdminController.updateProductPosition);
router.put('/:id', upload.single('imageFile'), productAdminController.updateProduct);
router.get('/:id', productAdminController.getProductDetail);

module.exports = router;