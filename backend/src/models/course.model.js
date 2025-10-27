import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      minlength: [1, "Title must be at least 1 characters long"],
      maxlength: [50, "Title cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
      minlength: [4, "Description must be at least 4 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      public_id: {
        type: String,
        required: [true, "Image public_id is required"],
      },
      url: {
        type: String,
        required: [true, "Image URL is required"],
      },
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
