// backend/routes/bannerRoutes.js
const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/client/BannerController');

router.get('/', bannerController.getBanners);


module.exports = router;
