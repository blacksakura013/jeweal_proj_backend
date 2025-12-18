const mongoose = require('../../database');
const { Schema , Types} = mongoose;


 const Decimal128 = Types.Decimal128;


const toDecimal128 = (val, precision = 2) => {
  if (val === undefined || val === null) {
    return Decimal128.fromString((0).toFixed(precision));
  }
  const num = typeof val === 'number' ? val : parseFloat(val);
  return Decimal128.fromString(num.toFixed(precision));
};

const decimalSetter = (precision) => (val) => toDecimal128(val, precision);

// Common getter
const fromDecimal128 = (val) => parseFloat(val?.toString() ?? 0);


const SaleItemSchema = new Schema({
  stock_id: { type: String, required: true},
  image: { type: String, default: null },
  stone_code: { type: String}, 
  stone: { type: String, required: true }, 
  shape: { type: String },
  size: { type: String }, 
  color: { type: String }, 
  cutting: { type: String }, 
  quality: { type: String }, 
  clarity: { type: String }, 
  cer_type: { type: String }, 
  cer_no: { type: String }, 
  location: { type: String }, 
  lot_no: { type: String }, 
  type: { type: String },
  pcs: { type: Number, required: true }, 
    weight_per_piece: {  type: Schema.Types.Decimal128,
     set: decimalSetter(2), // 3 decimal places
    get: fromDecimal128,
   },

   weight: {  type: Schema.Types.Decimal128,
    set: decimalSetter(3),
    get: fromDecimal128 , required: true},

  price: {   type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128  , required: true},

  unit: {
    type: String,
    enum: ["pcs", "cts"] },
 amount: {  type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128 },
     
  discount_percent: {  type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128 , default : 0 },

  discount_amount: {  type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128, default: 0 },

  total_amount: {   type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128, required: true }, 
  labour: { type: String }, 
   labour_price: {type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128,   default: 0 },
  remark: { type: String },
  reserve_id: { type: Schema.Types.ObjectId, ref: 'Reserve' },
  from_reserve: { type: Boolean, default: false }, 
});

// Summary Schema
const SaleSummarySchema = new Schema({
  sub_total: { type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128, required: true, required: true },
  discount: { type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128  , default: 0 },
    
  discount_amount: {type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128 , default: 0 },
    
  total_after_discount: { type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128,  required: true },
  vat: { type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128  },
  vat_amount: { type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128  },
  other_charge: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128 },

  grand_total: { type: Schema.Types.Decimal128,
   set: decimalSetter(2),
    get: fromDecimal128,  required: true }
});

// Sale Schema
const SaleSchema = new Schema(
  {
    invoice_no: { type: String, required: true, index: { unique: true, sparse: true }},
    doc_date: { type: Date, required: true },
    due_date: { type: Date, required: true },
    account: { type: String, required: true },
       vendor_code_id:{
      type: String,
      required: false
    },
    invoice_address: { type: String },
    shipping_address: { type: String },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    exchange_rate: { type: Number, required: true },
    ref_1: { type: String },
    ref_2: { type: String },
    items: [SaleItemSchema],
    summary: SaleSummarySchema,
    remark: { type: String },
    note: { type: String },
    status: { type: String, enum: ["active", "cancelled"], default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', SaleSchema);

SaleSchema.set("toJSON", { getters: true });
SaleSchema.set("toObject", { getters: true });