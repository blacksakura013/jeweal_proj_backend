const mongoose = require('../../database');
const { Schema } = mongoose;

const bankSchema = new Schema({
  bank_name: {type: String,required: true},
  branch_name: {type: String,required: true},
  account_name: {type: String,required: true},
  account_number: {type: String,required: true},
  swift_code: {type: String,required: true},
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Bank', bankSchema);