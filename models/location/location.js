const mongoose = require('../../database'); 
const { Schema } = mongoose;

const LocationSchema = new Schema({
  code: { type: String, required: true },
  location_name: { type: String, required: true },
  location_detail: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
},{ versionKey: false });

module.exports = mongoose.model('Location', LocationSchema);