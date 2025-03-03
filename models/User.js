const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  lastLogin: { type: Date },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  tenant: { type: String, default: 'default' },
}, { timestamps: true });

// Pre-save hook để băm mật khẩu nếu thay đổi
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Phương thức so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
