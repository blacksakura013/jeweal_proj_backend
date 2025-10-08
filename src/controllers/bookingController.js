import Booking from "../models/Booking.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

// ฟังก์ชันตรวจสอบ Booking หมดอายุ
const expireBookingIfNeeded = async (booking) => {
  if (booking.expiresAt < new Date()) {
    await Product.updateMany({ sn: { $in: booking.items } }, { status: "available" });
    await Booking.findByIdAndDelete(booking._id);
    return true;
  }
  return false;
};

// สร้างหรืออัปเดต Booking
export const createOrUpdateBooking = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: "ไม่พบรายการสินค้าที่ต้องการจอง" });

    const sns = items.map(i => (typeof i === "string" ? i : i.sn));
    const products = await Product.find({ sn: { $in: sns } });
    const unavailable = products.filter(p => p.status !== "available");
    if (unavailable.length > 0) return res.status(400).json({ message: `สินค้าบางรายการไม่สามารถจองได้: ${unavailable.map(u => u.sn).join(", ")}` });

    let booking = await Booking.findOne({ user: req.user._id });

    if (booking) {
      if (await expireBookingIfNeeded(booking)) {
        booking = await Booking.create({
          items: sns,
          user: req.user._id,
          expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        });
        await Product.updateMany({ sn: { $in: sns } }, { status: "booked" });
        return res.status(201).json({ message: "Products booked successfully (new booking).", booking });
      }

      const newItems = sns.filter(sn => !booking.items.includes(sn));
      await Product.updateMany({ sn: { $in: newItems } }, { status: "booked" });
      booking.items.push(...newItems);
      booking.expiresAt = new Date(Date.now() + 2 * 60 * 1000);
      await booking.save();

      return res.json({ message: "Booking updated successfully.", booking });
    }

    booking = await Booking.create({
      items: sns,
      user: req.user._id,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });
    await Product.updateMany({ sn: { $in: sns } }, { status: "booked" });

    res.status(201).json({ message: "Products booked successfully.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// เพิ่มสินค้าเข้า Booking
export const addProductsToBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: "ไม่พบรายการสินค้าที่ต้องการเพิ่ม" });

    const sns = items.map(i => (typeof i === "string" ? i : i.sn));
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "ไม่พบการจองนี้" });
    if (await expireBookingIfNeeded(booking)) return res.status(400).json({ message: "การจองหมดอายุแล้ว" });

    const products = await Product.find({ sn: { $in: sns } });
    const unavailable = products.filter(p => p.status !== "available");
    if (unavailable.length > 0) return res.status(400).json({ message: `สินค้าบางรายการไม่สามารถจองได้: ${unavailable.map(u => u.sn).join(", ")}` });

    await Product.updateMany({ sn: { $in: sns } }, { status: "booked" });
    booking.items.push(...sns);
    booking.expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    await booking.save();

    res.json({ message: "เพิ่มสินค้าลง Booking เรียบร้อย", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ลบสินค้าออกจาก Booking
export const removeProductsFromBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { items } = req.body;
    if (!items?.length) return res.status(400).json({ message: "ไม่พบรายการสินค้าที่ต้องการลบ" });

    const sns = items.map(i => (typeof i === "string" ? i : i.sn));
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "ไม่พบการจองนี้" });
    if (await expireBookingIfNeeded(booking)) return res.status(400).json({ message: "การจองหมดอายุแล้ว" });

    await Product.updateMany({ sn: { $in: sns } }, { status: "available" });
    booking.items = booking.items.filter(sn => !sns.includes(sn));

    if (!booking.items.length) {
      await Booking.findByIdAndDelete(bookingId);
      return res.json({ message: "ไม่มีสินค้าคงเหลือ การจองถูกลบเรียบร้อย" });
    }

    await booking.save();
    res.json({ message: "ลบสินค้าจาก Booking เรียบร้อย", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ดึง Booking ของผู้ใช้
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });

    const result = await Promise.all(
      bookings.map(async booking => {
        const products = await Product.find({ sn: { $in: booking.items } });
        return {
          bookingId: booking._id,
          status: booking.status,
          createdAt: booking.createdAt,
          expiresAt: booking.expiresAt,
          products: products.map(p => ({
            sn: p.sn,
            sku: p.sku,
            metal: p.metal,
            qty: p.qty,
            price: p.price,
            description: p.description,
            img: p.img,
            status: p.status,
          })),
        };
      })
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ยืนยันขายสินค้า
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "ไม่พบข้อมูลการจอง" });
    if (await expireBookingIfNeeded(booking)) return res.status(400).json({ message: "การจองหมดอายุแล้ว" });

    const products = await Product.find({ sn: { $in: booking.items } });
    await Product.updateMany({ sn: { $in: booking.items } }, { status: "sold" });

    await Sale.insertMany(products.map(p => ({
      sn: p.sn,
      sku: p.sku,
      price: p.price,
      user: req.user._id,
      soldAt: new Date(),
    })));

    await Booking.findByIdAndDelete(bookingId);

    res.json({ message: "Sale confirmed successfully", salesCount: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
