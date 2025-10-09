import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const saleSchema = new mongoose.Schema(
  {
    saleNo: {
      type: String,
      unique: true,
      default: () => uuidv4() // สร้าง saleNo อัตโนมัติเป็น UUID
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        sn: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sale", saleSchema);
