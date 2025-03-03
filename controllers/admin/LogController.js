const AuditLog = require('../../models/AuditLog');

const logController = {
  getLogs: async (req, res) => {
    try {
      // Lấy logs sắp xếp theo thời gian giảm dần, populate thông tin user
      const logs = await AuditLog.find()
        .populate('user', 'username')
        .sort({ createdAt: -1 });
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy lịch sử logs', error: error.message });
    }
  }
};

module.exports = logController;
