import express from "express";
import {
  getProducts,
  recoverProducts,
} from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: จัดการข้อมูลสินค้า
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: ดึงข้อมูลสินค้าทั้งหมด
 *     description: ใช้สำหรับดึงรายการสินค้าทั้งหมดในสต็อก
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสินค้าสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sn:
 *                     type: string
 *                   sku:
 *                     type: string
 *                   metal:
 *                     type: string
 *                   qty:
 *                     type: number
 *                   price:
 *                     type: number
 *                   description:
 *                     type: string
 *                   img:
 *                     type: string
 *                   status:
 *                     type: string
 *                 example:
 *                   sn: "A1B2C3D4E5F6"
 *                   sku: "SB0321BKGDM-43"
 *                   metal: "18KWG"
 *                   qty: 1
 *                   price: 31800
 *                   description: "-"
 *                   img: "N/A"
 *                   status: "available"
 */
router.get("/", protect, getProducts);

/**
 * @swagger
 * /products/recover:
 *   post:
 *     summary: กู้คืนข้อมูลสินค้า (จาก JSON)
 *     description: ใช้สำหรับนำข้อมูลสินค้าจากแอป (JSON) กลับมาทับ collection เดิมในฐานข้อมูล
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 sn:
 *                   type: string
 *                   description: หมายเลขประจำสินค้า (สุ่มไม่ซ้ำ)
 *                 sku:
 *                   type: string
 *                 metal:
 *                   type: string
 *                 qty:
 *                   type: number
 *                 price:
 *                   type: number
 *                 description:
 *                   type: string
 *                 img:
 *                   type: string
 *                 status:
 *                   type: string
 *             example:
 *               - 
 *     responses:
 *       200:
 *         description: อัปเดตสินค้าสำเร็จ
 *       400:
 *         description: รูปแบบข้อมูลไม่ถูกต้อง
 */
router.post("/recover", protect, recoverProducts);

export default router;
