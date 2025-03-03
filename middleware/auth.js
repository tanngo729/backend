const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { calculateEffectivePermissions } = require('../helpers/permissions');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Không tìm thấy token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).populate({
      path: 'roles',
      populate: { path: 'permissions', select: 'name' }
    });
    if (!user) {
      return res.status(401).json({ message: 'User không tồn tại' });
    }
    // Tính toán effectivePermissions ngay tại đây
    user.effectivePermissions = calculateEffectivePermissions(user);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ', error: error.message });
  }
};

module.exports = auth;
