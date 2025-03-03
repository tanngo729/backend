const Category = require('../../models/Category');
const { logAction } = require('../../helpers/auditLogger');

const categoryAdminController = {
  // Lấy danh sách danh mục với hỗ trợ phân trang, tìm kiếm, lọc theo trạng thái
  getCategoryList: async (req, res) => {
    try {
      const { page = "1", limit = "10", search, status } = req.query;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const filter = { deleted: false };

      if (search) {
        // Tìm kiếm theo tên không phân biệt hoa thường
        filter.name = { $regex: search, $options: 'i' };
      }
      if (status && ['active', 'inactive'].includes(status)) {
        filter.status = status;
      }

      const categories = await Category.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const total = await Category.countDocuments(filter);

      res.status(200).json({ data: categories, total });
    } catch (error) {
      console.error("Error in getCategoryList:", error);
      res.status(500).json({
        message: 'Lỗi khi lấy danh sách danh mục',
        error: error.message,
      });
    }
  },

  // Lấy chi tiết một danh mục theo ID
  getCategoryDetail: async (req, res) => {
    try {
      const id = req.params.id;
      const category = await Category.findOne({ _id: id, deleted: false });
      if (!category) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      res.status(200).json(category);
    } catch (error) {
      console.error("Error in getCategoryDetail:", error);
      res.status(500).json({
        message: 'Lỗi khi lấy chi tiết danh mục',
        error: error.message,
      });
    }
  },

  // Tạo danh mục mới
  createCategory: async (req, res) => {
    try {
      const { name, description, image, parent, status } = req.body;
      if (!name) {
        return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
      }
      const existing = await Category.findOne({ name, deleted: false });
      if (existing) {
        return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
      }
      const newCategory = new Category({
        name,
        description,
        image,
        parent: parent ? parent : null,
        status: status ? status : 'active',
      });
      await newCategory.save();

      // Ghi log hành động
      await logAction(req.user, 'CREATE_CATEGORY', `Tạo danh mục: ${newCategory.name}`);

      res.status(201).json(newCategory);
    } catch (error) {
      console.error("Error in createCategory:", error);
      res.status(500).json({
        message: 'Lỗi khi tạo danh mục',
        error: error.message,
      });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const { name, description, image, parent, status } = req.body;

      if (name) {
        const existing = await Category.findOne({
          name,
          _id: { $ne: id },
          deleted: false,
        });
        if (existing) {
          return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });
        }
      }

      const updatedCategory = await Category.findOneAndUpdate(
        { _id: id, deleted: false },
        { name, description, image, parent: parent ? parent : null, status },
        { new: true, runValidators: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }

      // Ghi log hành động
      await logAction(req.user, 'UPDATE_CATEGORY', `Cập nhật danh mục: ${updatedCategory.name}`);

      res.status(200).json(updatedCategory);
    } catch (error) {
      console.error("Error in updateCategory:", error);
      res.status(500).json({
        message: 'Lỗi khi cập nhật danh mục',
        error: error.message,
      });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const result = await Category.findByIdAndDelete(id);
      if (!result) {
        return res.status(404).json({ message: 'Không tìm thấy danh mục' });
      }
      // Ghi log hành động
      await logAction(req.user, 'DELETE_CATEGORY', `Xóa danh mục: ${result.name}`);

      res.status(200).json({ message: 'Đã xóa danh mục thành công' });
    } catch (error) {
      res.status(500).json({
        message: 'Lỗi khi xóa danh mục',
        error: error.message,
      });
    }
  },
};

module.exports = categoryAdminController;