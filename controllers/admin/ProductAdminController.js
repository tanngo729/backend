const mongoose = require('mongoose');
const Product = require('../../models/Product');
const cloudinary = require('../../config/cloudinary');
const { logAction } = require('../../helpers/auditLogger');

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

const productAdminController = {
  // Lấy danh sách sản phẩm cho admin
  getProductListForAdmin: async (req, res) => {
    try {
      const status = req.query.status;
      const searchTerm = req.query.search;
      let filter = {};

      if (status && status !== 'all') {
        filter.status = status;
      }
      if (searchTerm) {
        filter.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      const products = await Product.find(filter)
        .collation({ locale: 'vi', strength: 1 })
        .select('-__v')
        .sort({ createdAt: -1 });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách sản phẩm admin',
        error: error.message
      });
    }
  },

  // Cập nhật trạng thái sản phẩm
  updateProductStatus: async (req, res) => {
    try {
      const productId = req.params.id;
      const newStatus = req.body.status;

      if (!['active', 'inactive'].includes(newStatus)) {
        return res.status(400).json({
          message: 'Trạng thái không hợp lệ. Chỉ chấp nhận "active" hoặc "inactive".'
        });
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { status: newStatus },
        { new: true, runValidators: true }
      ).select('-__v');

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật trạng thái' });
      }

      await logAction(req.user, 'UPDATE_PRODUCT_STATUS',
        `Cập nhật trạng thái sản phẩm: ${updatedProduct.name} sang ${newStatus}`
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi cập nhật trạng thái sản phẩm',
        error: error.message
      });
    }
  },

  // Xóa sản phẩm (hard delete)
  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(productId);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
      }

      await logAction(req.user, 'DELETE_PRODUCT',
        `Xóa sản phẩm: ${deletedProduct.name}`
      );

      res.status(200).json({ message: `Sản phẩm ${deletedProduct.name} đã được xóa thành công` });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi xóa sản phẩm',
        error: error.message
      });
    }
  },

  // Xóa hàng loạt sản phẩm
  batchDeleteProducts: async (req, res) => {
    try {
      console.log("Batch delete request body:", req.body);
      const productIds = req.body.productIds;
      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: 'Vui lòng chọn ít nhất một sản phẩm để xóa.' });
      }

      // Lọc ra các ID hợp lệ
      const validProductIds = productIds.filter(id => mongoose.Types.ObjectId.isValid(id));
      if (validProductIds.length === 0) {
        return res.status(400).json({ message: 'Không có ID sản phẩm hợp lệ.' });
      }

      const deleteResult = await Product.deleteMany({ _id: { $in: validProductIds } });
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào để xóa với các ID đã cung cấp.' });
      }

      // Ghi log hành động batch delete
      await logAction(req.user, 'BATCH_DELETE_PRODUCTS', `Xóa hàng loạt ${deleteResult.deletedCount} sản phẩm`);

      res.status(200).json({ message: `Đã xóa thành công ${deleteResult.deletedCount} sản phẩm.` });
    } catch (error) {
      console.error("Error in batchDeleteProducts:", error);
      res.status(500).json({ message: 'Lỗi khi xóa hàng loạt sản phẩm', error: error.message });
    }
  },

  // Tạo sản phẩm mới
  createProduct: async (req, res) => {
    try {
      let imageUrl = '';
      if (req.file) {
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url;
      } else if (req.body.imageUrl) {
        let urlField = req.body.imageUrl;
        if (Array.isArray(urlField)) {
          urlField = urlField[0];
        }
        if (typeof urlField === 'string' && urlField.trim() !== '') {
          imageUrl = urlField.trim();
        }
      }
      const { name, description, price, status, position } = req.body;
      const newProduct = new Product({
        name,
        description,
        price,
        image: imageUrl,
        status,
        position,
      });
      await newProduct.save();

      await logAction(req.user, 'CREATE_PRODUCT',
        `Tạo sản phẩm: ${newProduct.name}`
      );

      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error in createProduct:", error);
      res.status(500).json({
        message: 'Lỗi khi tạo sản phẩm',
        error: error.message
      });
    }
  },

  // Cập nhật vị trí sản phẩm
  updateProductPosition: async (req, res) => {
    try {
      const productId = req.params.id;
      const { position } = req.body;
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { position },
        { new: true, runValidators: true }
      ).select('-__v');
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật thứ tự' });
      }

      await logAction(req.user, 'UPDATE_PRODUCT_POSITION',
        `Cập nhật vị trí sản phẩm: ${updatedProduct.name} sang ${position}`
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi cập nhật thứ tự sản phẩm',
        error: error.message
      });
    }
  },

  // Cập nhật thông tin sản phẩm
  updateProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      // Tạo object updateData ban đầu rỗng
      const updateData = {};

      // Nếu có các trường được gửi lên, cập nhật tương ứng
      if (req.body.name !== undefined) {
        updateData.name = req.body.name;
      }
      if (req.body.description !== undefined) {
        updateData.description = req.body.description;
      }
      if (req.body.price !== undefined) {
        const price = parseFloat(req.body.price);
        if (isNaN(price)) {
          return res.status(400).json({ message: 'Giá phải là số hợp lệ' });
        }
        updateData.price = price;
      }
      if (req.body.status !== undefined) {
        updateData.status = req.body.status;
      }
      if (req.body.position !== undefined) {
        const position = parseInt(req.body.position, 10);
        if (isNaN(position)) {
          return res.status(400).json({ message: 'Vị trí phải là số hợp lệ' });
        }
        updateData.position = position;
      }
      // Hỗ trợ trường "featured" (nổi bật)
      if (req.body.featured !== undefined) {
        // Nếu gửi về kiểu string ("true" hoặc "false") bạn có thể ép kiểu bằng Boolean(req.body.featured)
        updateData.featured = req.body.featured === 'true' || req.body.featured === true;
      }

      // Xử lý upload ảnh nếu có file đính kèm
      if (req.file) {
        const result = await streamUpload(req.file.buffer);
        updateData.image = result.secure_url;
      } else if (req.body.imageUrl !== undefined) {
        let urlField = req.body.imageUrl;
        if (Array.isArray(urlField)) {
          urlField = urlField[0];
        }
        if (typeof urlField === 'string' && urlField.trim() !== '') {
          updateData.image = urlField.trim();
        }
      }

      console.log("updateData:", updateData);

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true, context: 'query' }
      ).select('-__v');

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
      }

      console.log("Updated product:", updatedProduct);

      await logAction(req.user, 'UPDATE_PRODUCT',
        `Cập nhật sản phẩm: ${updatedProduct.name}`
      );

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        message: 'Lỗi khi cập nhật sản phẩm',
        error: error.message
      });
    }
  },

  // Lấy chi tiết sản phẩm
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
      res.status(500).json({
        message: 'Lỗi khi lấy thông tin sản phẩm',
        error: error.message
      });
    }
  },
};

module.exports = productAdminController;
