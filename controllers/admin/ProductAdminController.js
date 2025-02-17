// backend/controllers/admin/ProductAdminController.js
const Product = require('../../models/Product');
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

const productAdminController = {
  getProductListForAdmin: async (req, res) => {
    try {
      const status = req.query.status;
      const searchTerm = req.query.search; // Lấy giá trị query parameter 'search'

      let filter = {}; // Khởi tạo filter object rỗng

      if (status && status !== 'all') {
        filter.status = status; // Filter theo trạng thái (nếu có)
      }

      if (searchTerm) { // Nếu có từ khóa tìm kiếm
        filter.$or = [ // Tìm kiếm theo cả tên và mô tả
          { name: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      // Sử dụng collation để so sánh không phân biệt dấu cho tiếng Việt
      const products = await Product.find(filter)
        .collation({ locale: 'vi', strength: 1 })
        .select('-__v')
        .sort({ createdAt: -1 });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm admin', error: error.message });
    }
  },

  updateProductStatus: async (req, res) => {
    try {
      const productId = req.params.id; // Lấy ID sản phẩm từ URL params
      const newStatus = req.body.status; // Lấy trạng thái mới từ request body

      if (!['active', 'inactive'].includes(newStatus)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ. Chỉ chấp nhận "active" hoặc "inactive".' }); // Validate status
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { status: newStatus }, // Cập nhật trường status
        { new: true, runValidators: true } // options: new: true để trả về sản phẩm đã cập nhật, runValidators: true để validate schema
      ).select('-__v'); // Lấy sản phẩm đã cập nhật và loại bỏ __v

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật trạng thái' }); // Trả về 404 nếu không tìm thấy
      }

      res.status(200).json(updatedProduct); // Trả về sản phẩm đã cập nhật
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái sản phẩm', error: error.message });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const productId = req.params.id; // Lấy ID sản phẩm từ URL params

      const deletedProduct = await Product.findByIdAndDelete(productId); // Tìm và xóa sản phẩm theo ID

      if (!deletedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' }); // Trả về 404 nếu không tìm thấy
      }

      res.status(200).json({ message: `Sản phẩm ${deletedProduct.name} đã được xóa thành công` }); // Trả về thông báo thành công
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
  },
  batchDeleteProducts: async (req, res) => {
    try {
      const productIds = req.body.productIds; // Lấy mảng productIds từ request body

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ message: 'Vui lòng chọn ít nhất một sản phẩm để xóa.' });
      }

      // Xóa các sản phẩm có _id nằm trong mảng productIds
      const deleteResult = await Product.deleteMany({ _id: { $in: productIds } });

      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào để xóa với các ID đã cung cấp.' });
      }

      res.status(200).json({ message: `Đã xóa thành công ${deleteResult.deletedCount} sản phẩm.` });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa hàng loạt sản phẩm', error: error.message });
    }
  },

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
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error in createProduct:", error);
      res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
    }
  },


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
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật thứ tự sản phẩm', error: error.message });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      let { name, description, price, status, position } = req.body;

      console.log("Received update request:", { name, description, price, status, position });

      // Ép kiểu và kiểm tra nếu không hợp lệ
      price = parseFloat(price);
      position = parseInt(position, 10);
      if (isNaN(price)) {
        console.log("Price is not valid:", req.body.price);
        return res.status(400).json({ message: 'Giá phải là số hợp lệ' });
      }
      if (isNaN(position)) {
        console.log("Position is not valid:", req.body.position);
        return res.status(400).json({ message: 'Vị trí phải là số hợp lệ' });
      }

      // Tạo object chứa dữ liệu cập nhật
      const updateData = { name, description, price, status, position };

      // Cập nhật hình ảnh: ưu tiên file upload, nếu không thì dùng URL
      if (req.file) {
        const result = await streamUpload(req.file.buffer);
        updateData.image = result.secure_url;
        console.log("Image updated from file:", updateData.image);
      } else if (req.body.imageUrl) {
        let urlField = req.body.imageUrl;
        if (Array.isArray(urlField)) {
          urlField = urlField[0];
        }
        if (typeof urlField === 'string' && urlField.trim() !== '') {
          updateData.image = urlField.trim();
          console.log("Image updated from URL:", updateData.image);
        }
      }

      console.log("updateData:", updateData);

      // Cập nhật sản phẩm
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateData,
        { new: true, runValidators: true, context: 'query' }
      ).select('-__v');

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
      }
      console.log("Updated product:", updatedProduct);
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
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

module.exports = productAdminController;