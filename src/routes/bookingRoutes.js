import express from "express";
import {
  createOrUpdateBooking,
  addProductsToBooking,
  removeProductsFromBooking,
  getBookings,
  confirmBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: จัดการการจองสินค้า
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: ดึง Booking ของผู้ใช้
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการ Booking
 */
router.get("/", protect, getBookings);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: สร้างหรืออัปเดต Booking
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
 *                     qty:
 *                       type: number
 *     responses:
 *       201:
 *         description: Booking ถูกสร้างหรืออัปเดตเรียบร้อย
 */
router.post("/", protect, createOrUpdateBooking);

/**
 * @swagger
 * /bookings/add/{bookingId}:
 *   post:
 *     summary: เพิ่มสินค้าเข้า Booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของ Booking
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
 *     responses:
 *       200:
 *         description: เพิ่มสินค้าเรียบร้อย
 */
router.post("/add/:bookingId", protect, addProductsToBooking);

/**
 * @swagger
 * /bookings/remove/{bookingId}:
 *   post:
 *     summary: ลบสินค้าออกจาก Booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของ Booking
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
 *     responses:
 *       200:
 *         description: ลบสินค้าเรียบร้อย
 */
router.post("/remove/:bookingId", protect, removeProductsFromBooking);

/**
 * @swagger
 * /bookings/confirm/{bookingId}:
 *   post:
 *     summary: ยืนยันขายสินค้า
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID ของ Booking
 *     responses:
 *       200:
 *         description: ยืนยันขายสินค้าเรียบร้อย
 */
router.post("/confirm/:bookingId", protect, confirmBooking);

export default router;
