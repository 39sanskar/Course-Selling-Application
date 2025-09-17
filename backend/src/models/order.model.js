import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  paymentId: { type: String, required: true },  // from payment gateway
  transactionId: { type: String },              // additional tracking
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "upi", "paypal", "stripe", "razorpay"],
    required: true,
  },
  currency: { type: String, default: "INR" },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded", "cancelled"],
    default: "pending",
  },
  invoiceUrl: { type: String },
  purchasedAt: { type: Date, default: Date.now },
  accessExpiresAt: { type: Date },
}, { timestamps: true });

export const Order = mongoose.model("Order", orderSchema);
