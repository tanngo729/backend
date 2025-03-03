const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/UserController');
const auth = require('../../middleware/auth');

// Các endpoint này yêu cầu người dùng phải xác thực
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
