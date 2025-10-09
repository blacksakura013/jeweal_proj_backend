import fs from "fs";
import path from "path";
import Product from "../models/Product.js";
import Booking from "../models/Booking.js";
import Sale from "../models/Sale.js";
import { expireBookingIfNeeded } from "./bookingController.js"; // import ฟังก์ชัน

// ✅ ดึงสินค้าทั้งหมด พร้อมตรวจสอบ booking
export const getProducts = async (req, res) => {
  try {
    // หา booking pending ของ user
    let booking = await Booking.findOne({
      user: req.user._id,
      status: "pending",
    });

    if (booking) {
      // ตรวจสอบ booking หมดอายุหรือยัง
      const expired = await expireBookingIfNeeded(booking);

      if (expired) {
        // หมดอายุ → สร้าง booking ใหม่ในอนาคต
        booking = null;
      } else {
        // ยัง pending → ตรวจสอบ item ใน booking ว่ามีอะไรหมดอายุหรือไม่
        const now = new Date();
        for (const item of booking.items) {
          if (booking.expiresAt && booking.expiresAt < now) {
            // คืนสินค้ากลับเป็น available
            await Product.updateOne(
              { "items.sn": item.sn },
              { $set: { "items.$.status": "available" } }
            );
          }
        }
      }
    }

    // ดึงสินค้าทั้งหมด หลังจาก reset booking หรือคืนสินค้าแล้ว
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

// ✅ กู้คืนสินค้า (รีเซ็ตข้อมูลใหม่ทั้งหมดจาก products.json)
export const recoverProducts = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "src/data/products.json");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "products.json not found" });
    }

    const rawData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(rawData);

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty products.json" });
    }

    // ล้างข้อมูลเก่าออกก่อน
    await Product.deleteMany({});
    await Booking.deleteMany({});
    await Sale.deleteMany({});

    // เพิ่มข้อมูลใหม่
    const result = await Product.insertMany(products);

    res.status(200).json({
      message: "Products recovered successfully",
      count: result.length,
    });
  } catch (error) {
    console.error("Error recovering products:", error);
    res.status(500).json({ message: "Failed to recover products" });
  }
};
