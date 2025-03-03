const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/admin/PermissionController');

router.get('/', permissionController.getPermissions);
router.post('/', permissionController.createPermission);
router.put('/:id', permissionController.updatePermission);
router.delete('/:id', permissionController.deletePermission);

module.exports = router;
