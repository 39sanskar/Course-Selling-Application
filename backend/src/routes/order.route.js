import express from "express";
import { createOrder, getAllOrders } from "../controllers/order.controller.js";
import userMiddleware from "../middlewares/user.middleware.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// ---------------- CREATE ORDER ----------------
router.post("/", userMiddleware, createOrder);

// ---------------- GET ALL ORDERS (ADMIN) ----------------
router.get("/all", adminMiddleware, getAllOrders);

export default router;
