import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  category: { type: String, required: true },
  tags: [String],
  lessons: [
    {
      title: { type: String, required: true },
      videoUrl: String,
      duration: Number,
      resources: [String],
      isPreviewFree: { type: Boolean, default: false },
    }
  ],
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    }
  ],
  averageRating: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  totalEnrollments: { type: Number, default: 0 },
  language: { type: String, default: "English" },
  level: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  creatorId: { type: mongoose.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Course = mongoose.model("Course", courseSchema);
