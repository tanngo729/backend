// backend/controllers/BannerController.js
const Banner = require('../../models/Banner');

const bannerController = {
  // Lấy danh sách banner
  getBanners: async (req, res) => {
    try {
      const banners = await Banner.find().sort({ position: 1, createdAt: -1 });
      res.status(200).json(banners);
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách banner',
        error: error.message,
      });
    }
  },
};

module.exports = bannerController;
