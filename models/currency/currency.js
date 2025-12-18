const mongoose = require('../../database');
const { Schema } = mongoose;

const CurrencySchema = new Schema({
  code: { type: String, required: true },
  currency_name: { type: String, required: true },
  currency_type: { type: String, required: true ,default:"fiat" },
  currency_detail: { type: String },
  selling_rate: { type: Number, required: true },
  buying_rate: { type: Number, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('Currency', CurrencySchema);
