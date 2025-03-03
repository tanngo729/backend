// backend/middleware/authorize.js
const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (req.user && req.user.roles && req.user.roles.some(role => role.name.toLowerCase() === requiredRole.toLowerCase())) {
      return next();
    }
    return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
  };
};

module.exports = authorize;
