import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  sn: {
    type: String,
    required: true,
    unique: true, // serial number ต้องไม่ซ้ำกัน
    trim: true
  },
  status: {
    type: String,
    enum: ["available", "booked", "sold"], // ✅ เปลี่ยน reserved → booked ให้ตรงกับ bookingController
    default: "available"
  }
});

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    metal: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      default: "-"
    },
    img: {
      type: String,
      default: "N/A"
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "archived"],
      default: "available"
    },
    items: {
      type: [itemSchema],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "Product must have at least one item."
      }
    },
    qty: {
      type: Number,
      default: function () {
        return this.items.filter(i => i.status === "available").length;
      }
    }
  },
  { timestamps: true }
);

/**
 * ✅ อัปเดตจำนวนสินค้า (qty) ให้ตรงกับสถานะ available ทุกครั้งที่มีการ save
 */
productSchema.pre("save", function (next) {
  this.qty = this.items.filter(i => i.status === "available").length;
  next();
});

export default mongoose.model("Product", productSchema);
