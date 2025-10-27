import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0, // percentage (0 - 100)
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// Prevent duplicate purchases (1 user can buy 1 course only once)
purchaseSchema.index({ userId: 1, courseId: 1 }, { unique: true });


export const Purchase = mongoose.model("Purchase", purchaseSchema);
