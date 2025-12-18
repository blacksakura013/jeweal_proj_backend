const mongoose = require('../../database');

const subLocationSchema = new mongoose.Schema({
  code: { type: String, required: true },
  location_name: { type: String, required: true },
  location_type: { type: String, required: true },
  location_detail: { type: String },
  Field: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('SubLocation', subLocationSchema);
