// backend/routes/admin/index.js
const express = require('express');
const router = express.Router();

const productAdminRoutes = require('./productAdminRoutes');

router.use('/products', productAdminRoutes);

module.exports = router;