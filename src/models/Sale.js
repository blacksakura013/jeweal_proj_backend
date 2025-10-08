import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    sn: { type: String, required: true },
    sku: String,
    metal: String,
    price: Number,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;
