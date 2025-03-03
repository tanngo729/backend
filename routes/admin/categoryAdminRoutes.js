// backend/routes/admin/categoryAdminRoutes.js
const express = require('express');
const router = express.Router();
const categoryAdminController = require('../../controllers/admin/CategoryAdminController');
const permissionCheck = require('../../middleware/permissionCheck');

// Lấy danh sách danh mục (hỗ trợ phân trang, tìm kiếm, lọc)
router.get('/', permissionCheck('category.view'), categoryAdminController.getCategoryList);

// Lấy chi tiết danh mục theo ID
router.get('/:id', permissionCheck('category.view'), categoryAdminController.getCategoryDetail);

// Tạo danh mục mới
router.post('/', permissionCheck('category.create'), categoryAdminController.createCategory);

// Cập nhật danh mục theo ID
router.put('/:id', permissionCheck('category.edit'), categoryAdminController.updateCategory);

// Xóa danh mục (xóa mềm)
router.delete('/:id', permissionCheck('category.delete'), categoryAdminController.deleteCategory);

module.exports = router;
