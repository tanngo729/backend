// backend/routes/client/productClientRoutes.js
const express = require('express');
const router = express.Router();
const productClientController = require('../../controllers/client/ProductClientController');

router.get('/', productClientController.getProductsForClient);
router.get('/:id', productClientController.getProductDetail);

module.exports = router;