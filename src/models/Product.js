import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  sn: { type: String, required: true },
  sku: { type: String, required: true },
  metal: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  img: { type: String },
  status: { type: String },
});

export default mongoose.model("Product", productSchema);
