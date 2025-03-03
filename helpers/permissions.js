function calculateEffectivePermissions(user) {
  if (user.roles && Array.isArray(user.roles)) {
    // Nếu có role Admin thì full access
    if (user.roles.some(role => role.name.toLowerCase() === 'admin')) {
      return ['*'];
    }
    const effectivePermissions = [];
    user.roles.forEach(role => {
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach(perm => {
          if (perm.name && !effectivePermissions.includes(perm.name)) {
            effectivePermissions.push(perm.name);
          }
        });
      } else {
        console.warn(`Role ${role.name} không có dữ liệu permissions`);
      }
    });
    return effectivePermissions;
  }
  return [];
}
module.exports = { calculateEffectivePermissions };
