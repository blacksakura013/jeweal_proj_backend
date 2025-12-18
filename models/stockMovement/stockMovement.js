const mongoose = require('../../database')

const stockMovementSchema = new mongoose.Schema({
  stock_id: { type: String, required: true },
  stone_code: { type: String, required: true },
  lot_no: { type: String, required: false },
  stone: { type: String },
  shape: { type: String },
  size: { type: String },
  color: { type: String },
  cutting: { type: String },
  quality: { type: String },
  clarity: { type: String },
  type: { type: String, enum: ['in', 'out'], required: true },
  in_weight: { type: Number, required: true },
  in_pcs: { type: Number, required: true },
  out_weight: { type: Number, required: true },
  out_pcs: { type: Number, required: true },
  price_per_unit: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});
stockMovementSchema.virtual('balance_weight').get(function() {
  return this.type === 'in' ? this.weight : -this.weight;
});

stockMovementSchema.virtual('balance_pcs').get(function() {
  return this.type === 'in' ? this.pcs : -this.pcs;
});
stockMovementSchema.virtual('amount').get(function () {
  return this.pcs * this.price_per_unit;
});
stockMovementSchema.virtual('stock_cost').get(function () {
  return this.type === 'in' ? this.amount : 0;
});
stockMovementSchema.virtual('stock_value').get(function () {
  return this.type === 'out' ? this.amount : 0; 
});
stockMovementSchema.virtual('profit').get(function () {
  return this.stock_value - this.stock_cost;
});
module.exports = mongoose.model('StockMovement', stockMovementSchema);