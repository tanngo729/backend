const User = require('../../models/User');

const userController = {
  // Lấy thông tin profile của user hiện tại (dựa vào req.user được gán bởi middleware auth)
  getProfile: async (req, res) => {
    try {
      // Lấy thông tin user từ DB để đảm bảo dữ liệu mới nhất (loại bỏ trường password và __v)
      const user = await User.findById(req.user._id).select('-password -__v');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
  },

  // Cập nhật thông tin profile (chỉ cho phép cập nhật các trường như fullName, phone, address)
  updateProfile: async (req, res) => {
    try {
      const { fullName, phone, address } = req.body;
      // Không cho phép cập nhật email, username hay password ở đây (email thường là immutable)
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { fullName, phone, address },
        { new: true, runValidators: true }
      ).select('-password -__v');

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
  }
};

module.exports = userController;
