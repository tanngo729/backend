const express = require('express');
const router = express.Router();
const logController = require('../../controllers/admin/LogController');
const permissionCheck = require('../../middleware/permissionCheck');

// Endpoint này yêu cầu quyền 'audit_log.view'
router.get('/', permissionCheck('audit_log.view'), logController.getLogs);

module.exports = router;
