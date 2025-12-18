const mongoose = require('../../database');

const configSchema = new mongoose.Schema({
  name: { type: String, required: true },
  config_data: { type: String, required: true },
  config_type: { type: String, enum: ['currency', 'shortcut_menu'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Config', configSchema);
