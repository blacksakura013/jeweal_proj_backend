import express from "express";
import { createBooking, confirmBooking } from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: API สำหรับจัดการการจองสินค้า
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: สร้างการจองสินค้า (Booking)
 *     description: จองสินค้าตามหมายเลข S/N ที่ระบุ โดยจะมีเวลาจำกัด 2 นาที หากไม่ยืนยันขาย ระบบจะคืนสินค้าเข้าสต็อกโดยอัตโนมัติ
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sn:
 *                       type: string
 *                       example: "A1B2C3D4E5F6"
 *     responses:
 *       201:
 *         description: จองสินค้าเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Products booked successfully (expire in 2 minutes).
 *                 booking:
 *                   type: object
 *       400:
 *         description: ไม่มีสินค้าหรือข้อมูลไม่ถูกต้อง
 *       500:
 *         description: ข้อผิดพลาดภายในระบบ
 */
router.post("/", protect, createBooking);

/**
 * @swagger
 * /bookings/confirm/{bookingId}:
 *   post:
 *     summary: ยืนยันการขายสินค้า (Confirm Booking)
 *     description: เมื่อยืนยันแล้ว สินค้าจะถูกเปลี่ยนสถานะเป็น "sold" และย้ายข้อมูลไปยังตารางการขาย (Sale)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookingId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัส Booking ที่ต้องการยืนยัน
 *     responses:
 *       200:
 *         description: ยืนยันการขายเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sale confirmed and recorded successfully.
 *                 salesCount:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Booking หมดอายุหรือไม่พบข้อมูล
 *       500:
 *         description: ข้อผิดพลาดภายในระบบ
 */
router.post("/confirm/:bookingId", protect, confirmBooking);

export default router;
