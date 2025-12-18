const mongoose = require("../../database");
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


const ConsignmentSchema = new Schema(
  {
    
    image: { type: String, default: null },
    type: { type: String, required: true },
    memo_no: { type: String, required: true },
    due_date : { type: Date, required: true },
    doc_date : { type: Date, required: true },
    account: { type: String, required: true },
    ref: { type: String },
    ref_no: { type: String },
    stone_code: { type: String },
    stock_id: { type: String, required: true },
    lot_no: { type: String },
    stone: { type: String, required: true },
    shape: { type: String },
    size: { type: String },
    color: { type: String },
    cutting: { type: String },
    quality: { type: String },
    clarity: { type: String },
    cer_type: { type: String },
    cer_no: { type: String },
    pcs: { type: Number}, 
    reserved_pcs: { type: Number , default: 0 }, 
    memoout_pcs: { type: Number , default: 0 },   
    weight: { type: Schema.Types.Decimal128,
    set: decimalSetter(3),
    get: fromDecimal128, default : 0},
      weight_per_piece: {  type: Schema.Types.Decimal128,
     set: decimalSetter(2), // 3 decimal places
    get: fromDecimal128,
   },
    price: { type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128 },
    unit: { type: String },
    amount: { type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128},
     discount_percent: { type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128 , default: 0 }, 
    discount_amount: { type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128, default: 0 }, 
    currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: true },
    remark: { type: String }
  },
  { timestamps: true }
);

ConsignmentSchema.set("toJSON", { getters: true });
ConsignmentSchema.set("toObject", { getters: true });

module.exports = mongoose.model("Consignment", ConsignmentSchema);


