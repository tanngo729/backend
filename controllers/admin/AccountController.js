// controllers/admin/AccountController.js
const User = require('../../models/User');
const streamUpload = require('../../helpers/uploadToCloudinary');
const { logAction } = require('../../helpers/auditLogger');

const accountController = {
  // Lấy danh sách tài khoản (giữ nguyên)
  getAccounts: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      let { search = '', role = '', status = '', page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'descend' } = req.query;
      page = parseInt(page);
      limit = parseInt(limit);
      const filter = { tenant };

      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }
      if (status) filter.status = status;
      if (role) filter.roles = role;

      const skip = (page - 1) * limit;
      const sortObj = {};
      sortObj[sortField] = sortOrder === 'ascend' ? 1 : -1;

      const accounts = await User.find(filter)
        .populate('roles', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
      const total = await User.countDocuments(filter);

      res.status(200).json({
        accounts,
        currentPage: page,
        pageSize: limit,
        total,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching accounts', error: error.message });
    }
  },

  // Tạo tài khoản mới với upload avatar qua Cloudinary
  createAccount: async (req, res) => {
    try {
      const { username, email, password, fullName, roles, phone, address } = req.body;
      const tenant = req.user.tenant;
      const exists = await User.findOne({ $or: [{ username }, { email }], tenant });
      if (exists) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      let avatarUrl = '';
      if (req.file) {
        const result = await streamUpload(req.file.buffer);
        avatarUrl = result.secure_url;
      }

      const user = new User({
        username,
        email,
        password,
        fullName,
        roles,
        phone,
        address,
        tenant,
        avatarUrl,
        status: 'pending'
      });
      await user.save();

      // Ghi log hành động
      await logAction(req.user, 'CREATE_ACCOUNT', `Tạo tài khoản: ${username}`);

      console.log(`Send activation email to ${email}`);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error creating account', error: error.message });
    }
  },

  updateAccount: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const { id } = req.params;
      let updates = req.body;

      if (req.file) {
        const result = await streamUpload(req.file.buffer);
        updates.avatarUrl = result.secure_url;
      }

      let updatedUser;
      if (updates.password) {
        const user = await User.findOne({ _id: id, tenant });
        if (!user) return res.status(404).json({ message: 'Account not found' });
        user.password = updates.password;
        if (updates.username) user.username = updates.username;
        if (updates.email) user.email = updates.email;
        if (updates.fullName) user.fullName = updates.fullName;
        if (updates.phone) user.phone = updates.phone;
        if (updates.address) user.address = updates.address;
        if (updates.roles) user.roles = updates.roles;
        if (updates.status) user.status = updates.status;
        if (updates.avatarUrl) user.avatarUrl = updates.avatarUrl;
        updatedUser = await user.save();
      } else {
        delete updates.password;
        updatedUser = await User.findOneAndUpdate({ _id: id, tenant }, updates, { new: true, runValidators: true });
        if (!updatedUser) return res.status(404).json({ message: 'Account not found' });
      }

      // Ghi log hành động
      await logAction(req.user, 'UPDATE_ACCOUNT', `Cập nhật tài khoản: ${updatedUser.username}`);

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating account', error: error.message });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const { id } = req.params;
      const user = await User.findOneAndDelete({ _id: id, tenant });
      if (!user) return res.status(404).json({ message: 'Account not found' });

      // Ghi log hành động
      await logAction(req.user, 'DELETE_ACCOUNT', `Xóa tài khoản: ${user.username}`);

      res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting account', error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const tenant = req.user.tenant;
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) return res.status(400).json({ message: 'New password is required' });
      const user = await User.findOne({ _id: id, tenant });
      if (!user) return res.status(404).json({ message: 'Account not found' });
      user.password = newPassword;
      await user.save();

      // Ghi log hành động
      await logAction(req.user, 'RESET_PASSWORD', `Đặt lại mật khẩu cho tài khoản: ${user.username}`);

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
  },
};

module.exports = accountController;
