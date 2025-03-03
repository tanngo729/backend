// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-tokens', authController.refreshToken);

module.exports = router;
