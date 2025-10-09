import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        sn: { type: String, required: true }, // ส่งเฉพาะ SN
      },
    ],
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    bookingCode: {
      type: String,
      unique: true,
      default: () => uuidv4(),
    },
  },
  { timestamps: true }
);

// ✅ Partial unique index: ผู้ใช้สามารถมี booking pending ได้เพียง 1 รายการ
bookingSchema.index(
  { user: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

/**
 * ตรวจสอบ booking หมดอายุ
 * - ถ้าหมดอายุ → คืนสินค้าเป็น available และลบ booking
 */
bookingSchema.statics.expireBookingIfNeeded = async function (booking) {
  if (!booking || booking.status !== "pending") return false;

  if (booking.expiresAt < new Date()) {
    const Product = mongoose.model("Product");
    for (const item of booking.items) {
      await Product.updateOne(
        { "items.sn": item.sn },
        { $set: { "items.$.status": "available" } }
      );
    }

    // ลบ booking ทันที
    await booking.deleteOne();
    return true;
  }

  return false;
};

export default mongoose.model("Booking", bookingSchema);
