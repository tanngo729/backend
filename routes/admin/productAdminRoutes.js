const express = require('express');
const router = express.Router();
const productAdminController = require('../../controllers/admin/ProductAdminController');
const upload = require('../../middleware/multer');
const permissionCheck = require('../../middleware/permissionCheck');

// Đặt route batch delete trước route có parameter :id
router.delete('/batch', permissionCheck('product.delete'), productAdminController.batchDeleteProducts);
router.delete('/:id', permissionCheck('product.delete'), productAdminController.deleteProduct);

router.get('', permissionCheck('product.view'), productAdminController.getProductListForAdmin);
router.post('', upload.single('imageFile'), permissionCheck('product.create'), productAdminController.createProduct);
router.put('/:id', upload.single('imageFile'), permissionCheck('product.edit'), productAdminController.updateProduct);
router.put('/:id/status', permissionCheck('product.edit'), productAdminController.updateProductStatus);
router.put('/:id/position', permissionCheck('product.edit'), productAdminController.updateProductPosition);
router.get('/:id', permissionCheck('product.view'), productAdminController.getProductDetail);

module.exports = router;
