import Booking from "../models/Booking.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

// สร้าง booking
export const createBooking = async (req, res) => {
  try {
    const { items } = req.body; // [{ sn }]
    const userId = req.user._id;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items provided." });

    const sns = items.map((i) => i.sn);
    const products = await Product.find({ sn: { $in: sns } });
    if (products.length !== sns.length) throw new Error("Some S/N not found.");

    // ตรวจสอบและอัปเดตสถานะ
    for (const product of products) {
      if (product.status !== "available") {
        throw new Error(`S/N ${product.sn} is not available.`);
      }
      product.status = "reserved";
      await product.save();
    }

    // สร้าง Booking ใหม่
    const booking = await Booking.create({
      user: userId,
      items: sns,
      status: "pending",
      createdAt: new Date(),
    });

    // ตั้งเวลาคืนสินค้าอัตโนมัติ 2 นาที (120,000 ms)
    setTimeout(async () => {
      const checkBooking = await Booking.findById(booking._id);
      if (checkBooking && checkBooking.status === "pending") {
        console.log(`⏰ Booking expired: ${booking._id}`);

        // คืนสินค้ากลับสต็อก
        await Product.updateMany(
          { sn: { $in: booking.items } },
          { $set: { status: "available" } }
        );

        // อัปเดต booking เป็น expired
        checkBooking.status = "expired";
        await checkBooking.save();
      }
    }, 2 * 60 * 1000); // 2 นาที

    res.status(201).json({
      message: "Products booked successfully (expire in 2 minutes).",
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ยืนยันขาย
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found.");

    // ตรวจสอบหมดเวลา
    const diff = Date.now() - new Date(booking.createdAt).getTime();
    if (diff > 2 * 60 * 1000) {
      // คืนสินค้า (ถ้าเกินเวลาแล้ว)
      await Product.updateMany(
        { sn: { $in: booking.items } },
        { $set: { status: "available" } }
      );

      booking.status = "expired";
      await booking.save();
      return res.status(400).json({
        message: "Booking expired. Products returned to stock.",
      });
    }

    const products = await Product.find({ sn: { $in: booking.items } });

    const sales = [];
    for (const product of products) {
      if (product.status !== "reserved") {
        throw new Error(`S/N ${product.sn} cannot be sold (not reserved).`);
      }

      product.status = "sold";
      await product.save();

      sales.push({
        sn: product.sn,
        sku: product.sku,
        price: product.price,
        metal: product.metal,
        user: userId,
      });
    }

    await Sale.insertMany(sales);
    booking.status = "completed";
    await booking.save();

    res.json({
      message: "Sale confirmed and recorded successfully.",
      salesCount: sales.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
