const express = require('express');
const router = express.Router();
const permissionCheck = require('../../middleware/permissionCheck');

const productAdminRoutes = require('./productAdminRoutes');
const categoryAdminRoutes = require('./categoryAdminRoutes');
const permissionRoutes = require('./permissionRoutes');
const roleRoutes = require('./roleRoutes');
const accountRoutes = require('./accountRoutes');
const logRoutes = require('./logRoutes');
const userRoutes = require('./userRoutes');
const bannerRoutes = require('./bannerRoutes');

router.use('/products', productAdminRoutes);
router.use('/categories', categoryAdminRoutes);
router.use('/permissions', permissionCheck('permission.view'), permissionRoutes);
router.use('/roles', permissionCheck('role.view'), roleRoutes);
router.use('/accounts', permissionCheck('user.view'), accountRoutes);
router.use('/logs', permissionCheck('audit_log.view'), logRoutes);
router.use('/', userRoutes);
router.use('/banners', permissionCheck('banner.view'), bannerRoutes);

module.exports = router;
