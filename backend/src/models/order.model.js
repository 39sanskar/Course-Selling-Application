import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },

    paymentId: {
      type: String, // Stripe PaymentIntent ID or Razorpay order ID
      required: [true, "Payment ID is required"],
      unique: true, // Prevents duplicate payments
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount must be greater than 0"],
    },

    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "inr",
      uppercase: true,
    },

    status: {
      type: String,
      enum: ['pending', 'failed', 'completed', 'succeeded'],
      default: 'pending',
      required: [true, "Status is required"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

export const Order = mongoose.model("Order", orderSchema);
