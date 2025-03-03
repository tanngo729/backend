const Role = require('../../models/Role');
const { logAction } = require('../../helpers/auditLogger');

const roleController = {
  createRole: async (req, res) => {
    try {
      const { name, description, parent, permissions } = req.body;
      const tenant = req.user.tenant;
      const role = new Role({
        name,
        description,
        parent: parent || null,
        permissions: permissions || [],
        tenant,
      });
      await role.save();
      await logAction(req.user, 'CREATE_ROLE', `Tạo nhóm quyền: ${role.name}`);
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ message: 'Error creating role', error: error.message });
    }
  },

  getRoles: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const roles = await Role.find({ tenant })
        .populate('permissions')
        .populate('parent');
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
  },

  updateRole: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const { id } = req.params;
      const updates = req.body;
      const role = await Role.findOneAndUpdate({ _id: id, tenant }, updates, { new: true, runValidators: true });
      if (!role) return res.status(404).json({ message: 'Role not found' });
      await logAction(req.user, 'UPDATE_ROLE', `Cập nhật nhóm quyền: ${role.name}`);
      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ message: 'Error updating role', error: error.message });
    }
  },

  deleteRole: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const { id } = req.params;
      const role = await Role.findOneAndDelete({ _id: id, tenant });
      if (!role) return res.status(404).json({ message: 'Role not found' });
      await logAction(req.user, 'DELETE_ROLE', `Xóa nhóm quyền: ${role.name}`);
      res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting role', error: error.message });
    }
  },
};

module.exports = roleController;