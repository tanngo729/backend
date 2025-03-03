const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  module: { type: String, required: true },
  description: { type: String, default: '' },
  tenant: { type: String, default: 'default' },
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
