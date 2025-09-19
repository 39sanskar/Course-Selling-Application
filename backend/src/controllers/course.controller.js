import { Course } from "../models/course.model.js";
import { v2 as cloudinary } from "cloudinary";

// ============================
// COURSE CONTROLLERS
// ============================

// Create Course
export const createCourse = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, price } = req.body;

  try {
    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ errors: "No image uploaded" });
    }

    const { image } = req.files;
    const allowedFormats = ["image/png", "image/jpeg"];
    if (!allowedFormats.includes(image.mimetype)) {
      return res.status(400).json({ errors: "Only PNG/JPG images allowed" });
    }

    // Upload to Cloudinary
    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
    if (!cloud_response || cloud_response.error) {
      return res.status(400).json({ errors: "Error uploading to Cloudinary" });
    }

    const course = await Course.create({
      title,
      description,
      price: Number(price),
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.secure_url,
      },
      creatorId: adminId,
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ errors: "Internal server error" });
  }
};

// Update Course
export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title, description, price } = req.body;

  try {
    const course = await Course.findOne({ _id: courseId, creatorId: adminId });
    if (!course) {
      return res.status(404).json({ errors: "Course not found or unauthorized" });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price ? Number(price) : course.price;

    if (req.files && req.files.image) {
      const { image } = req.files;
      const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);

      if (course.image?.public_id) {
        await cloudinary.uploader.destroy(course.image.public_id);
      }

      course.image = {
        public_id: cloud_response.public_id,
        url: cloud_response.secure_url,
      };
    }

    await course.save();
    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ errors: "Internal server error" });
  }
};

// Delete Course
export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;

  try {
    const course = await Course.findOneAndDelete({ _id: courseId, creatorId: adminId });
    if (!course) {
      return res.status(404).json({ errors: "Course not found or unauthorized" });
    }

    if (course.image?.public_id) {
      await cloudinary.uploader.destroy(course.image.public_id);
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ errors: "Internal server error" });
  }
};

// Get All Courses
export const getCourses = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    const courses = await Course.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      courses,
    });
  } catch (error) {
    console.error("Error getting courses:", error);
    res.status(500).json({ errors: "Internal server error" });
  }
};

// Get Course Details
export const courseDetails = async (req, res) => {
  const { courseId } = req.params;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ errors: "Course not found" });

    res.status(200).json({ course });
  } catch (error) {
    console.error("Error in course details:", error);
    res.status(500).json({ errors: "Internal server error" });
  }
};
