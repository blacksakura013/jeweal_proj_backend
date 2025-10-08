import fs from "fs";
import path from "path";
import Booking from "../models/Booking.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
// ดึงสินค้าทั้งหมด
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recovery Products จาก JSON
export const recoverProducts = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "src/data/products.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const products = JSON.parse(rawData);

    // ลบ collection เดิม
    await Product.deleteMany({});
    await Booking.deleteMany({});
    await Sale.deleteMany({});
    
    // ใส่ข้อมูล JSON ใหม่
    await Product.insertMany(products);

    res.json({
      message: "Products recovered successfully",
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
