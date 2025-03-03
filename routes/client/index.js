// backend/routes/client/index.js
const express = require('express');
const router = express.Router();

const productClientRoutes = require('./productClientRoutes');
const bannerRoutes = require('./bannerRoutes');

router.use('/products', productClientRoutes);
router.use('/banners', bannerRoutes);

module.exports = router;