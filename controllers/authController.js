// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAuthTokens } = require('../helpers/token.service');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      // Populate roles và nested permissions (chỉ lấy trường name)
      const user = await User.findOne({ email }).populate({
        path: 'roles',
        populate: { path: 'permissions', select: 'name' }
      });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không hợp lệ' });
      }

      // Chỉ cho phép tài khoản active đăng nhập
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'Tài khoản chưa được kích hoạt' });
      }

      // Tính effectivePermissions từ các role
      let effectivePermissions = [];
      if (user.roles.some(role => role.name === 'Admin')) {
        effectivePermissions = ['*']; // Full access cho Admin
      } else {
        user.roles.forEach(role => {
          if (role.permissions && Array.isArray(role.permissions)) {
            role.permissions.forEach(perm => {
              if (!effectivePermissions.includes(perm.name)) {
                effectivePermissions.push(perm.name);
              }
            });
          }
        });
      }
      // Gán effectivePermissions vào user (cho middleware sử dụng sau này)
      user.effectivePermissions = effectivePermissions;

      user.lastLogin = new Date();
      await user.save();
      const tokens = await generateAuthTokens(user);
      console.log("User after login:", user); // Debugging line
      res.status(200).json({ user, tokens });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: 'Lỗi khi đăng nhập', error: error.message });
    }
  },

  logout: async (req, res) => {
    res.status(200).json({ message: 'Đăng xuất thành công' });
  },

  refreshToken: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.sub);
      if (!user) return res.status(401).json({ message: 'User không tồn tại' });
      const tokens = await generateAuthTokens(user);
      res.status(200).json(tokens);
    } catch (error) {
      res.status(401).json({ message: 'Refresh token không hợp lệ', error: error.message });
    }
  },
};

module.exports = authController;
