// backend/controllers/BannerController.js
const Banner = require('../../models/Banner');
const { logAction } = require('../../helpers/auditLogger'); // Đảm bảo bạn đã có hàm logAction
const cloudinary = require('../../config/cloudinary');

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    stream.end(buffer);
  });
};

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

  // Tạo banner mới
  createBanner: async (req, res) => {
    try {
      const { title, link, position, active } = req.body;
      const bannerData = { title, position, active };

      // Trường link không bắt buộc
      bannerData.link = typeof link === 'string' ? link.trim() : '';

      if (req.file) {
        const result = await streamUpload(req.file.buffer);
        bannerData.image = result.secure_url;
      } else if (!req.body.imageUrl) {
        return res.status(400).json({ message: 'Vui lòng cung cấp ảnh banner' });
      } else {
        let urlField = req.body.imageUrl;
        if (Array.isArray(urlField)) {
          urlField = urlField[0];
        }
        if (typeof urlField === 'string' && urlField.trim() !== '') {
          bannerData.image = urlField.trim();
        } else {
          return res.status(400).json({ message: 'URL ảnh không hợp lệ' });
        }
      }

      const newBanner = await Banner.create(bannerData);
      await logAction(req.user, 'CREATE_BANNER', `Tạo banner: ${newBanner.title}`);
      res.status(201).json(newBanner);
    } catch (error) {
      console.error("Error in createBanner:", error);
      res.status(500).json({
        message: 'Lỗi khi tạo banner',
        error: error.message,
      });
    }
  },

  // Cập nhật banner (sửa banner)
  updateBanner: async (req, res) => {
    try {
      const bannerId = req.params.id;
      const { title, link, position, active } = req.body;
      const updateData = { title, position, active };

      // Nếu link được truyền lên, xử lý (nếu không, bỏ qua)
      if (typeof link === 'string') {
        updateData.link = link.trim();
      } else {
        updateData.link = ''; // Hoặc bỏ qua trường này, tùy theo yêu cầu
      }

      if (req.file) {
        const result = await streamUpload(req.file.buffer);
        updateData.image = result.secure_url;
      }

      const updatedBanner = await Banner.findByIdAndUpdate(
        bannerId,
        updateData,
        { new: true, runValidators: true }
      );
      if (!updatedBanner) {
        return res.status(404).json({ message: 'Không tìm thấy banner để cập nhật' });
      }

      await logAction(req.user, 'UPDATE_BANNER', `Cập nhật banner: ${updatedBanner.title}`);
      res.status(200).json(updatedBanner);
    } catch (error) {
      console.error("Error in updateBanner:", error);
      res.status(500).json({
        message: 'Lỗi khi cập nhật banner',
        error: error.message,
      });
    }
  },

  // Cập nhật vị trí banner
  updateBannerPosition: async (req, res) => {
    try {
      const bannerId = req.params.id;
      const { position } = req.body;
      if (!position || isNaN(position)) {
        return res.status(400).json({ message: 'Vui lòng cung cấp vị trí hợp lệ' });
      }
      const updatedBanner = await Banner.findByIdAndUpdate(
        bannerId,
        { position },
        { new: true, runValidators: true }
      );
      if (!updatedBanner) {
        return res.status(404).json({ message: 'Không tìm thấy banner để cập nhật vị trí' });
      }

      await logAction(req.user, 'UPDATE_BANNER_POSITION',
        `Cập nhật vị trí banner: ${updatedBanner.title} sang ${position}`
      );
      res.status(200).json(updatedBanner);
    } catch (error) {
      console.error("Error in updateBannerPosition:", error);
      res.status(500).json({
        message: 'Lỗi khi cập nhật vị trí banner',
        error: error.message,
      });
    }
  },

  // Xóa banner
  deleteBanner: async (req, res) => {
    try {
      const bannerId = req.params.id;
      const deletedBanner = await Banner.findByIdAndDelete(bannerId);
      if (!deletedBanner) {
        return res.status(404).json({ message: 'Không tìm thấy banner để xóa' });
      }
      await logAction(req.user, 'DELETE_BANNER', `Xóa banner: ${deletedBanner.title}`);
      res.status(200).json({ message: 'Banner đã được xóa thành công' });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi xóa banner',
        error: error.message,
      });
    }
  },
};

module.exports = bannerController;
