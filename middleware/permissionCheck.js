// backend/middleware/permissionCheck.js
module.exports = (requiredPermission) => {
  return (req, res, next) => {
    const perms = req.user && req.user.effectivePermissions;
    if (perms && (perms.includes('*') || perms.includes(requiredPermission))) {
      return next();
    }
    return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này' });
  };
};
