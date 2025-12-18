const mongoose = require('../../database'); 
const { Schema, Types} =  mongoose;


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

const inventoryItemSchema = new Schema({
  image: { type: String, default: null },
  stone: { type: String },
  stock_id: { type: String },
  lot_no: { type: String }, 
  shape: { type: String },
  size: { type: String },
  color: { type: String },
  cutting: { type: String },
  quality: { type: String },
  clarity: { type: String },
  cer_type: { type: String },
  cer_no: { type: String },
  
  // CURRENT DATA (changes after Load operations)
  pcs: { type: Number, required: true }, 
  weight: { type: Schema.Types.Decimal128, set: decimalSetter(3), get: fromDecimal128, required: true },
   weight_per_piece: {  type: Schema.Types.Decimal128,
     set: decimalSetter(2), // 3 decimal places
    get: fromDecimal128,
   },
  total_amount: { type: Schema.Types.Decimal128, set: decimalSetter(2), get: fromDecimal128, required: true }, 
  price: { type: Schema.Types.Decimal128, set: decimalSetter(2), get: fromDecimal128, required: true },
  amount: { type: Schema.Types.Decimal128, set: decimalSetter(2), get: fromDecimal128 },
  
  // ADD ORIGINAL DATA FIELDS (never changes - always 200 PCS)
  original_pcs: { type: Number, required: true },
 
  discount_percent: { type: Schema.Types.Decimal128, set: decimalSetter(2), get: fromDecimal128, default: 0 },
  discount_amount: { type: Schema.Types.Decimal128, set: decimalSetter(2), get: fromDecimal128, default: 0 },
  due_date: { type: Date },
  ref_no: { type: String },
  remark: { type: String },
  status: { type: String, enum: ["active", "inactive", "deleted"] },
  labour_type: { type: String },
  labour_unit: { type: String },
  labour_price: { type: Schema.Types.Decimal128, set: decimalSetter(2), get: fromDecimal128, default: 0 },
  unit: {
  type: String,
  enum: ["pcs", "cts"],
  set: v => (v || "").toLowerCase()
},
});

// Summary Schema
const QuotationSummarySchema = new Schema({
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



  const inventoryInSchema = new Schema({
    invoice_no: { 
      type: String,
      required: true,
      index: { unique: true, sparse: true }
    },
    account: { 
      type: String,
      required: true,
      index: { sparse: true }
    },
    vendor_code_id:{
      type: String,
      required: false
    },
    invoice_address: { type: String },
    items: [inventoryItemSchema],
    inventory_type: { 
      type: String,
      enum: ["memo_in", "purchase_po", "purchase_pu"]
    },
    doc_date: { type: Date },
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    exchange_rate: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128  , required: true}, 
    due_date: { type: Date },
    ref_1: { type: String },
    ref_2: { type: String },
    summary: QuotationSummarySchema,
    remark: { type: String },
    note: { type: String },
      status: {
      type: String,
      enum: ["approved", "unapproved"],
      default: "unapproved"
    }
  },

  { timestamps: { createdAt: true, updatedAt: false } }
);

  module.exports = mongoose.model('InventoryIn', inventoryInSchema);

  
inventoryInSchema.set("toJSON", { getters: true });
inventoryInSchema.set("toObject", { getters: true });

