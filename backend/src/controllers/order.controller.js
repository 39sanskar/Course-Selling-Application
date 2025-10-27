import { Order } from "../models/order.model.js";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";
import { z } from "zod";
// ---------------- CREATE ORDER ----------------
export const createOrder = async (req, res) => {
  try {
    // Get userId from middleware (set by userMiddleware)
    const userId = req.userId;
    
    console.log("User ID from middleware:", userId);
    console.log("Request body:", req.body);

    if (!userId) {
      return res.status(401).json({
        errors: "User authentication required",
      });
    }

    // Define validation schema WITHOUT userId (we get it from middleware)
    const orderSchema = z.object({
      email: z.string().email({ message: "Valid email is required" }),
      courseId: z.string().min(1, "Course ID is required"),
      paymentId: z.string().min(1, "Payment ID is required"),
      amount: z.number().positive("Amount must be positive"),
      currency: z.string().min(1, "Currency is required"),
      status: z.string().min(1, "Payment status is required"),
    });

    // Validate request body (excluding userId)
    const validated = orderSchema.safeParse(req.body);
    if (!validated.success) {
      console.error("Validation error:", validated.error.issues);
      return res.status(400).json({
        errors: validated.error.issues.map((err) => err.message),
      });
    }

    const orderData = validated.data;
    console.log("Validated order data:", orderData);

    // Validate course exists
    const course = await Course.findById(orderData.courseId);
    if (!course) {
      return res.status(404).json({
        errors: ["Course not found"],
      });
    }

    // Check if payment was already processed
    const existingOrder = await Order.findOne({ paymentId: orderData.paymentId });
    if (existingOrder) {
      return res.status(400).json({
        errors: ["This payment was already processed."],
      });
    }

    // Check if user already purchased this course
    const existingPurchase = await Purchase.findOne({ 
      userId: userId, 
      courseId: orderData.courseId 
    });
    
    if (existingPurchase) {
      return res.status(400).json({
        errors: "You have already purchased this course.",
      });
    }

    // Create the order with userId from middleware
    const orderInfo = await Order.create({
      ...orderData,
      userId: userId // Use userId from middleware, not from request body
    });
    console.log("Order saved to DB:", orderInfo._id);

    // Record purchase for this user + course
    const purchase = await Purchase.create({
      userId: userId,
      courseId: orderData.courseId,
      paymentId: orderData.paymentId,
      amount: orderData.amount,
      currency: orderData.currency,
      status: orderData.status
    });
    console.log("Purchase recorded:", purchase._id);

    // Send success response
    res.status(201).json({
      message: "Order created and purchase recorded successfully",
      order: {
        id: orderInfo._id,
        courseId: orderInfo.courseId,
        amount: orderInfo.amount,
        currency: orderInfo.currency,
        status: orderInfo.status,
        createdAt: orderInfo.createdAt
      },
      purchase: {
        id: purchase._id,
        courseId: purchase.courseId,
        status: purchase.status,
        purchasedAt: purchase.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating order:", error);

    // Handle duplicate paymentId error gracefully
    if (error.code === 11000 && error.keyPattern?.paymentId) {
      return res.status(400).json({
        errors: "This payment was already processed.",
      });
    }

    // Handle duplicate purchase error
    if (error.code === 11000 && error.keyPattern?.userId && error.keyPattern?.courseId) {
      return res.status(400).json({
        errors: ["You have already purchased this course."],
      });
    }

    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        errors: errors
      });
    }

    // Handle invalid course ID
    if (error.name === 'CastError') {
      return res.status(400).json({
        errors: ["Invalid course ID format"],
      });
    }

    res.status(500).json({
      errors: "Internal server error while creating order: " + error.message,
    });
  }
};

// ---------------- GET ALL ORDERS (ADMIN ONLY) ----------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .populate("courseId", "title price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders 
    });
  } catch (error) {
    console.error(" Error fetching orders:", error);
    res.status(500).json({
      errors: "Internal server error while fetching orders",
    });
  }
};
