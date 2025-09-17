import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  purchaseDate: { type: Date, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "upi", "paypal", "stripe", "razorpay"],
  },

  // Learning progress tracking
  progress: { type: Number, default: 0, min: 0, max: 100 }, 
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
  lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId }, 
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },

  // Certificate
  certificateUrl: { type: String },
}, { timestamps: true });

// Prevent duplicate purchases
purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

// Auto-set completion when progress reaches 100
purchaseSchema.pre("save", function (next) {
  if (this.progress === 100 && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  next();
});

export const Purchase = mongoose.model("Purchase", purchaseSchema);

