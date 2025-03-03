// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.cloud_name.trim(),
  api_key: process.env.cloud_key.trim(),
  api_secret: process.env.cloud_secret.trim(),
});

module.exports = cloudinary;
