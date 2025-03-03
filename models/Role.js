const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  permissions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    default: []
  },
  tenant: { type: String, default: 'default' },
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
