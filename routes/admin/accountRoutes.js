// backend/routes/admin/accountRoutes.js
const express = require('express');
const router = express.Router();
const accountController = require('../../controllers/admin/AccountController');
const upload = require('../../middleware/multer');
const permissionCheck = require('../../middleware/permissionCheck');

router.get('/', permissionCheck('user.view'), accountController.getAccounts);
router.post('/', permissionCheck('user.register'), upload.single('avatar'), accountController.createAccount);
router.put('/:id', permissionCheck('user.edit'), upload.single('avatar'), accountController.updateAccount);
router.delete('/:id', permissionCheck('user.delete'), accountController.deleteAccount);
router.put('/:id/reset-password', permissionCheck('user.reset_password'), accountController.resetPassword);

module.exports = router;
