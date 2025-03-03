// backend/routes/admin/bannerRoutes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/admin/bannerController');
const upload = require('../../middleware/multer');
const permissionCheck = require('../../middleware/permissionCheck');

// Lấy danh sách banner
router.get('/', permissionCheck('banner.view'), bannerController.getBanners);
// Tạo banner mới (có upload ảnh)
router.post('/', upload.single('imageFile'), permissionCheck('banner.create'), bannerController.createBanner);
// Cập nhật banner
router.put('/:id', upload.single('imageFile'), permissionCheck('banner.edit'), bannerController.updateBanner);
// Cập nhật vị trí banner
router.put('/:id/position', permissionCheck('banner.edit'), bannerController.updateBannerPosition);
// Xóa banner
router.delete('/:id', permissionCheck('banner.delete'), bannerController.deleteBanner);

module.exports = router;
