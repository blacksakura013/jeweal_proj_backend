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
const PuItemSchema = new Schema({
 image: { type: String, default: null },
  stone: { type: String },
  shape: { type: String },
  size: { type: String },
  color: { type: String },
  cutting: { type: String },
  Quality: { type: String },
  clarity: { type: String },
  pcs: { type: Number , required: true },
  weight : { type: Schema.Types.Decimal128,
  set: decimalSetter(3),
    get: fromDecimal128 , required: true},
  price: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128 , required: true },
  unit: {
    type: String,
    enum: ["pcs", "cts"] },
  amount: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128 , required: true },
  Pu_no: { type: String },
}, { _id: false })
const LoadItemSchema = new Schema({
   image: { type: String, default: null },
  Pu_no: { type: String },
  pu_id: { type: String },
  pu_item_id: { type: String },
  pu_refs: [
    {
      pu_id: { type: String },
      pu_item_id: { type: String }
    }
  ],
  stone_code:{type: String},
  stock_id: { type: String, required: true, unique: true },
  location: { type: String },
  stone: { type: String },
  shape: { type: String },
  size: { type: String },
  color: { type: String },
  cutting: { type: String },
  quality: { type: String },
  clarity: { type: String },
  cer_type: { type: String },
  cer_no: { type: String },
  lot_no: { type: String },
  pcs: { type: Number  , required: true}, 
  weight_per_piece: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128 }, 
  weight: { type: Schema.Types.Decimal128,
  set: decimalSetter(3),
    get: fromDecimal128 , required: true},
  price: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128},
  stock_price: {type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128},
  sale_price: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128 },
 unit: {
    type: String,
    enum: ["pcs", "cts", ""],
    default: ""
  },
  sale_unit:{
    type: String,
    enum: ["pcs", "cts"]
  },
  stock_unit:{
    type: String,
    enum: ["pcs", "cts"]
  },
  amount: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128}, 
  stock_amount: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128}, 
  sale_amount: { type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128},
  remark: { type: String },
});

const LoadSchema = new Schema({
  invoice_no: { 
    type: String,
    required: true,
    index: { unique: true, sparse: true }
  },
  account: { 
    type: String,
    required: true
  },
  pu_item: [PuItemSchema],
  load_item: [LoadItemSchema],
  load_type: { type: String, enum: ["normal", "merge"] },
  doc_date: { type: Date },
  due_date: { type: Date },
  ref_1: { type: String },
  ref_2: { type: String },
  note: { type: String },
  status: {
    type: String,
    enum: ["approved", "unapproved"],
    default: "unapproved"
  }
  });


module.exports = mongoose.model('Load', LoadSchema);


LoadSchema.set("toJSON", { getters: true });
LoadSchema.set("toObject", { getters: true });