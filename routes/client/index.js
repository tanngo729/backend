// backend/routes/client/index.js
const express = require('express');
const router = express.Router();

const productClientRoutes = require('./productClientRoutes');

router.use('/products', productClientRoutes);

module.exports = router;