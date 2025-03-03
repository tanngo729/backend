const Permission = require('../../models/Permission');

const permissionController = {
  createPermission: async (req, res) => {
    try {
      const { name, module, description } = req.body;
      const tenant = req.user.tenant;
      const permission = new Permission({ name, module, description, tenant });
      await permission.save();
      res.status(201).json(permission);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi tạo quyền', error: error.message });
    }
  },

  getPermissions: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const permissions = await Permission.find({ tenant })
        .select('name module description')
        .sort({ createdAt: -1 });
      res.status(200).json(permissions);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy danh sách quyền', error: error.message });
    }
  },

  updatePermission: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const { id } = req.params;
      const updates = req.body;
      const permission = await Permission.findOneAndUpdate({ _id: id, tenant }, updates, { new: true, runValidators: true });
      if (!permission) return res.status(404).json({ message: 'Không tìm thấy quyền' });
      res.status(200).json(permission);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi cập nhật quyền', error: error.message });
    }
  },

  deletePermission: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const { id } = req.params;
      const permission = await Permission.findOneAndDelete({ _id: id, tenant });
      if (!permission) return res.status(404).json({ message: 'Không tìm thấy quyền' });
      res.status(200).json({ message: 'Xóa quyền thành công' });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi xóa quyền', error: error.message });
    }
  },
};

module.exports = permissionController;
