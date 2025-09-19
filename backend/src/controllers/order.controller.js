// order.controllers.js
import Stripe from "stripe";
import { Order } from "../models/order.model.js";
import { Purchase } from "../models/purchase.model.js";
import mongoose from "mongoose";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a new order and a Stripe PaymentIntent.
 * - creates an Order (status: 'pending') in DB inside a transaction
 * - creates a PaymentIntent with metadata.orderId for idempotency
 * - returns client_secret to frontend to complete payment
 */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId || req.user?.id || req.user?._id; // adapt depending on your auth middleware
    const { courseId, amount, currency = "INR", receipt } = req.body;

    // Basic validation
    if (!userId || !courseId || !amount) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Missing required fields: userId, courseId, amount" });
    }
    if (amount <= 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    // Create order record in DB: status pending until webhook confirms payment
    const orderDoc = await Order.create(
      [
        {
          userId,
          courseId,
          amount,
          currency,
          receipt: receipt || `order_${Date.now()}`,
          status: "pending",
        },
      ],
      { session }
    );

    const order = orderDoc[0];

    // Create PaymentIntent with metadata.orderId to ensure idempotency and link
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to smallest currency unit
      currency,
      metadata: { orderId: order._id.toString(), userId: userId.toString(), courseId: courseId.toString() },
      description: `Payment for course ${courseId} by user ${userId}`,
      receipt_email: req.user?.email || req.body.email, // optional
      // You can attach an idempotency key on server requests to Stripe if you want: { idempotencyKey: `order-${order._id}` } at request level.
    });

    // Save paymentIntent id in the order for later verification
    order.paymentIntentId = paymentIntent.id;
    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Return client_secret so frontend can confirm payment
    return res.status(201).json({
      message: "Order created. Use client_secret to complete payment.",
      orderId: order._id,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("createOrder error:", error);
    return res.status(500).json({ error: "Internal server error while creating order" });
  }
};

/**
 * Stripe webhook handler — should be mounted at the endpoint that stripe uses to post events.
 * - verifies signature using STRIPE_WEBHOOK_SECRET
 * - handles payment_intent.succeeded and marks order as 'paid', creates Purchase if not exists
 *
 * IMPORTANT: route must receive raw body and the raw buffer must be passed to this handler (see Stripe docs).
 * Example Express setup:
 * app.post("/webhook/stripe", express.raw({ type: 'application/json' }), orderWebhook);
 */
export const orderWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        const orderId = metadata.orderId;

        if (!orderId) {
          console.warn("payment_intent.succeeded received without orderId metadata.");
          break;
        }

        // Use a transaction to atomically update order and create purchase if not present
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          const order = await Order.findById(orderId).session(session);
          if (!order) {
            console.warn(`Order ${orderId} not found in DB.`);
            await session.abortTransaction();
            session.endSession();
            break;
          }

          // Idempotency: only process if not already marked paid
          if (order.status === "paid") {
            console.info(`Order ${orderId} already paid — ignoring duplicate webhook.`);
            await session.commitTransaction();
            session.endSession();
            break;
          }

          // Update order as paid
          order.status = "paid";
          order.paidAt = new Date();
          order.paymentMethod = "stripe";
          order.paymentIntentId = paymentIntent.id;
          await order.save({ session });

          // Create purchase if not existing for this user+course
          const existing = await Purchase.findOne({ userId: order.userId, courseId: order.courseId }).session(session);
          if (!existing) {
            await Purchase.create(
              [
                {
                  userId: order.userId,
                  courseId: order.courseId,
                  orderId: order._id,
                  purchasedAt: new Date(),
                },
              ],
              { session }
            );
          } else {
            console.info(`Purchase already exists for user ${order.userId} and course ${order.courseId}`);
          }

          await session.commitTransaction();
          session.endSession();
        } catch (err) {
          await session.abortTransaction();
          session.endSession();
          console.error("Error while processing payment_intent.succeeded webhook:", err);
          // Do not throw — send 500 so Stripe may retry
          return res.status(500).send();
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata || {};
        const orderId = metadata.orderId;
        if (orderId) {
          // mark as failed so admin / user can retry/pay
          await Order.findByIdAndUpdate(orderId, { status: "failed", lastPaymentError: paymentIntent.last_payment_error }, { new: true }).catch((e) =>
            console.error("Could not mark order as failed:", e)
          );
        }
        break;
      }

      // Add more event types as needed (refunds, disputes, etc.)
      default:
        console.info(`Unhandled event type ${event.type}`);
    }

    // Acknowledge receipt of the event
    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).send();
  }
};

/**
 * Get orders for the current user (paginated)
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, parseInt(req.query.limit || "10", 10));
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments({ userId }),
    ]);

    return res.json({
      page,
      limit,
      total,
      orders,
    });
  } catch (err) {
    console.error("getUserOrders error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get single order by id (only owner or admin)
 */
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId || req.user?.id || req.user?._id;
    if (!orderId) return res.status(400).json({ error: "Order id required" });

    const order = await Order.findById(orderId).populate("courseId", "title price").lean();
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Basic authorization: only owner or admin (assuming req.user.role)
    if (order.userId.toString() !== userId?.toString() && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({ order });
  } catch (err) {
    console.error("getOrderById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Optional: cancel an unpaid order
 */
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.userId || req.user?.id || req.user?._id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId.toString() !== userId?.toString()) return res.status(403).json({ error: "Forbidden" });

    if (order.status === "paid") return res.status(400).json({ error: "Cannot cancel a paid order" });

    order.status = "cancelled";
    await order.save();

    // Optionally cancel the PaymentIntent on Stripe if exists
    if (order.paymentIntentId) {
      try {
        await stripe.paymentIntents.cancel(order.paymentIntentId);
      } catch (err) {
        console.warn("Could not cancel payment intent on Stripe:", err);
      }
    }

    return res.json({ message: "Order cancelled", orderId: order._id });
  } catch (err) {
    console.error("cancelOrder error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  createOrder,
  orderWebhook,
  getUserOrders,
  getOrderById,
  cancelOrder,
};
