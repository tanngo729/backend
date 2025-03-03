// backend/controllers/client/ProductClientController.js
const Product = require('../../models/Product'); // Cập nhật đường dẫn tới Product model

const productClientController = {
  getProductsForClient: async (req, res) => {
    try {
      const products = await Product.find({ deleted: false, status: 'active' });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
    }
  },
  getProductDetail: async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await Product.findById(productId).select('-__v');
      if (!product) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product detail:", error);
      res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm', error: error.message });
    }
  },
};

module.exports = productClientController;