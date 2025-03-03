const AuditLog = require('../models/AuditLog');

const logAction = async (user, action, description) => {
  if (!user || !user._id) {
    console.warn("logAction: No valid user provided, skipping log.");
    return;
  }
  try {
    await AuditLog.create({
      user: user._id,
      action,
      description,
      ipAddress: user.ipAddress || '',
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
};

module.exports = { logAction };
