const mongoose = require('../../database')
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


const StockSchema = new Schema({
  image: { type: String, default: null },
 location: { type: Schema.Types.ObjectId, ref: 'SubLocation'},
  type: { type: String, required: true },
    Pu_no: { type: String},
  load_no: {type: String,required: true },
  doc_date: { type: Date },
  account: {type: String,required: true,index: { sparse: true } },
  ref: {type: String},
  stone_code: { type: String, required: true}, 
  stock_id : { type: String, required: true, }, 
  lot_no: {type: String,index: { sparse: true } },
  stone: { type: String, required: true },
  shape : { type :String},
  size: {type: String},
  color:{type: String},
  cutting:{type: String},
  quality:{type: String},
  clarity:{type: String},
  cer_type:{type: String},
  cer_no:{type: String},
  pcs: { type: Number, default: 0 }, 
  reserved_pcs: { type: Number , default: 0 }, 
  memoout_pcs: {type: Number , default: 0},
  weight: { type: Schema.Types.Decimal128,
    set: decimalSetter(3),
    get: fromDecimal128, default: 0 }, 
      weight_per_piece: {  type: Schema.Types.Decimal128,
     set: decimalSetter(2), // 3 decimal places
    get: fromDecimal128,
   },

  price:{type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128},
  sale_price:{type: Schema.Types.Decimal128,
  set: decimalSetter(2),
    get: fromDecimal128},
  unit: {
    type: String,
    enum: ["pcs", "cts", ""],
    default: "" 
  },
  amount: { type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128 },
  sale_amount: { type: Schema.Types.Decimal128,
    set: decimalSetter(2),
    get: fromDecimal128 },

  remark: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model('Stock', StockSchema);

StockSchema.set("toJSON", { getters: true });
StockSchema.set("toObject", { getters: true });