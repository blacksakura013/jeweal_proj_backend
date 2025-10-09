import Booking from "../models/Booking.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import { v4 as uuidv4 } from "uuid";
/**
 * ✅ ตรวจสอบและทำให้ booking หมดอายุ
 * คืนสินค้ากลับเป็น available
 */
export const expireBookingIfNeeded = async (booking) => {
  if (!booking || booking.status !== "pending") return false;

  if (booking.expiresAt < new Date()) {
    // คืนสินค้าเป็น available
    for (const item of booking.items) {
      await Product.updateOne(
        { "items.sn": item.sn },
        { $set: { "items.$.status": "available" } }
      );
    }

    // ลบ booking ที่หมดอายุ
    await Booking.findByIdAndDelete(booking._id);

    return true; // หมดอายุแล้ว
  }

  return false; // ยังไม่หมดอายุ
};

/**
 * สร้างหรืออัปเดต Booking
 * - ผู้ใช้สามารถสร้าง booking ได้ก็ต่อเมื่อยังไม่มี booking pending
 */
export const createOrUpdateBooking = async (req, res) => {
  console.log(res);
  try {
    const { items } = req.body;
    if (!items?.length) {
      return res.status(400).json({ message: "ไม่พบสินค้าที่เลือก" });
    }

    // ตรวจสอบว่าสินค้าว่าง
    const availableProducts = await Product.find({
      "items.sn": { $in: items.map((i) => i.sn) },
      "items.status": "available",
    });
    if (!availableProducts.length) {
      return res.status(400).json({ message: "สินค้าที่เลือกไม่ว่าง" });
    }

    // หา booking pending ของ user
    let booking = await Booking.findOne({
      user: req.user._id,
      status: "pending",
    });

    if (booking) {
      // ตรวจสอบ booking หมดอายุหรือยัง
      const expired = await Booking.expireBookingIfNeeded(booking);

      if (expired) {
        booking = null; // หมดอายุ → สร้าง booking ใหม่
      } else {
        // ยัง pending → อัปเดตรายการสินค้าใหม่
        const newItems = items.filter(
          (i) => !booking.items.some((b) => b.sn === i.sn)
        );
        if (newItems.length > 0) {
          booking.items.push(...newItems);
          await booking.save();

          // อัปเดตสินค้าใหม่เป็น booked
          for (const item of newItems) {
            await Product.updateOne(
              { "items.sn": item.sn },
              { $set: { "items.$.status": "booked" } }
            );
          }
        }

        // ถ้าไม่มี newItems แต่ user ส่งรายการเดียวกัน → return booking เดิม
        return res.status(200).json({ message: "Booking updated", booking });
      }
    }

    // สร้าง booking ใหม่
    booking = await Booking.create({
      user: req.user._id,
      items,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 นาที
    });

    // อัปเดตสินค้าเป็น booked
    for (const item of items) {
      await Product.updateOne(
        { "items.sn": item.sn },
        { $set: { "items.$.status": "booked" } }
      );
    }

    res.status(201).json({ message: "Booking created", booking });
  } catch (err) {
    console.error("Error creating/updating booking:", err);
    res
      .status(500)
      .json({
        message: "ไม่สามารถสร้าง/อัปเดต booking ได้",
        error: err.message,
      });
  }
};

/**
 * ลบสินค้าออกจาก Booking
 */
export const removeItemsFromBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { items } = req.body; // [{ sn }]
  if (!items?.length)
    return res.status(400).json({ message: "ไม่พบสินค้าที่ลบ" });

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "ไม่พบ Booking" });

    if (await expireBookingIfNeeded(booking))
      return res.status(400).json({ message: "Booking หมดอายุ" });

    // คืนสินค้าเป็น available
    for (const snObj of items) {
      await Product.updateOne(
        { "items.sn": snObj.sn },
        { $set: { "items.$.status": "available" } }
      );
    }

    booking.items = booking.items.filter(
      (i) => !items.some((s) => s.sn === i.sn)
    );

    if (!booking.items.length) {
      await Booking.findByIdAndDelete(bookingId);
      return res.json({ message: "ไม่มีสินค้าเหลือ Booking ถูกลบ" });
    }

    await booking.save();
    res.json({ message: "ลบสินค้าเรียบร้อย", booking });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "ไม่สามารถลบสินค้าได้", error: err.message });
  }
};

/**
 * ดึง Booking ของ user
 */
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const result = [];

    for (const booking of bookings) {
      if (await expireBookingIfNeeded(booking)) continue;

      const products = await Product.find({
        "items.sn": { $in: booking.items.map((i) => i.sn) },
      });

      const productDetails = [];
      for (const p of products) {
        const matched = p.items.filter((u) =>
          booking.items.some((bi) => bi.sn === u.sn)
        );
        matched.forEach((u) => {
          productDetails.push({
            sn: u.sn,
            sku: p.sku,
            name: p.name,
            metal: p.metal,
            price: p.price,
            img: p.img,
            status: u.status,
          });
        });
      }

      result.push({
        bookingId: booking._id,
        status: booking.status,
        createdAt: booking.createdAt,
        expiresAt: booking.expiresAt,
        products: productDetails,
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "ไม่สามารถดึง Booking ได้", error: err.message });
  }
};

/**
 * Confirm Booking → สร้าง Sale ใหม่
 */
export const confirmBooking = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "ไม่พบ Booking" });
    if (await expireBookingIfNeeded(booking))
      return res.status(400).json({ message: "Booking หมดอายุ" });

    const products = await Product.find({
      "items.sn": { $in: booking.items.map((i) => i.sn) },
    });

    // อัปเดตสถานะสินค้าเป็น sold
    for (const snObj of booking.items) {
      await Product.updateOne(
        { "items.sn": snObj.sn },
        { $set: { "items.$.status": "sold" } }
      );
    }

    const totalAmount = products.reduce((sum, p) => {
      const matched = p.items.filter((u) =>
        booking.items.some((bi) => bi.sn === u.sn)
      );
      return sum + matched.reduce((s, u) => s + p.price, 0);
    }, 0);

    const sale = await Sale.create({
      saleNo: uuidv4(), // เพิ่มบรรทัดนี้
      user: req.user._id,
      items: booking.items.map((i) => {
        const p = products.find((prod) =>
          prod.items.some((x) => x.sn === i.sn)
        );
        return { sn: i.sn, price: p.price };
      }),
      totalAmount,
      paymentStatus: "paid",
      booking: booking._id,
    });

    // ลบ booking หลัง confirm เพื่อให้ user สามารถสร้างใหม่ครั้งต่อไป
    await Booking.findByIdAndDelete(bookingId);

    res.json({
      message: "Sale confirmed",
      sale,
      salesCount: sale.items.length,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "ไม่สามารถยืนยันการขายได้", error: err.message });
  }
};
