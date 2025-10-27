import { Course } from "../models/course.model.js";
import { v2 as cloudinary } from "cloudinary";
import config from "../../config.js";
import { Purchase } from "../models/purchase.model.js";
import Stripe from "stripe";
const stripe = new Stripe(config.STRIPE_SECRET_KEY);
// ---------------- CREATE COURSE ----------------
export const createCourse = async (req, res) => {
  // Debug error 
  // console.log("Headers:", req.headers["content-type"]);
  // console.log("Body keys:", Object.keys(req.body));
  // console.log("Files:", req.files);

  const adminId = req.adminId;
  const { title, description, price } = req.body;

  try {

    console.log("[CREATE COURSE] Admin ID:", adminId);
    console.log("[CREATE COURSE] Request body:", { title, description, price });

    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ errors: "No file uploaded" });
    }

    const { image }  = req.files;
    const allowedFormat = ["image/png", "image/jpeg"];
    if (!allowedFormat.includes(image.mimetype)) {
      return res.status(400).json({
        errors: "Invalid file format. Only PNG and JPG are allowed",
      });
    }

    // cloudinary code
    const cloud_response = await cloudinary.uploader.upload(image.tempFilePath);
    if (!cloud_response || cloud_response.error) {
      return res
        .status(400)
        .json({ errors: "Error uploading file to cloudinary" });
    }

    // Save course in MongoDB
    const course = await Course.create({
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id,
        url: cloud_response.secure_url,
      },
      creatorId: adminId,
    });

    console.log("[CREATE COURSE] Course created successfully:", course._id);

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("[CREATE COURSE] Error:", error);
    res.status(500).json({ error: "Error creating course" });
  }
};

// ---------------- UPDATE COURSE ----------------
export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title, description, price, image } = req.body;

  try {
    console.log("[UPDATE COURSE] Admin ID:", adminId, "Course ID:", courseId);

    const course = await Course.findOneAndUpdate(
      { _id: courseId, creatorId: adminId },
      {
        title,
        description,
        price,
        image: image
          ? {
              public_id: image.public_id,
              url: image.url,
            }
          : undefined,
      },
      { new: true }
    );

    if (!course) {
      return res
        .status(404)
        .json({ errors: "Course not found or unauthorized" });
    }

    console.log("[UPDATE COURSE] Course updated successfully:", courseId);

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("[UPDATE COURSE] Error:", error);
    res.status(500).json({ errors: "Error in updating course" });
  }
};

// ---------------- DELETE COURSE ----------------
export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;

  try {
    console.log("[DELETE COURSE] Admin ID:", adminId, "Course ID:", courseId);

    const course = await Course.findOneAndDelete({
      _id: courseId,
      creatorId: adminId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ errors: "Course not found or unauthorized" });
    }

    console.log("[DELETE COURSE] Course deleted successfully:", courseId);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("[DELETE COURSE] Error:", error);
    res.status(500).json({ errors: "Error deleting course" });
  }
};

// ---------------- GET COURSES ----------------
export const getCourses = async (req, res) => {
  try {

    console.log("[GET COURSES] Fetching all courses");

    const courses = await Course.find({});

    console.log("[GET COURSES] Found", courses.length, "courses");

    res.status(201).json({ courses });
  } catch (error) {
    console.error("[GET COURSES] Error:", error);
    res.status(500).json({ errors: "Error in fetching courses" });
  }
};

// ---------------- COURSE DETAILS ----------------
export const courseDetails = async (req, res) => {
  const { courseId } = req.params;

  try {
    console.log("[COURSE DETAILS] Fetching course:", courseId);

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }

    res.status(200).json({ course });
  } catch (error) {
    console.error("[COURSE DETAILS] Error:", error);
    res.status(500).json({ errors: "Error in fetching course details" });
  }
};

// ---------------- BUY COURSE (INITIATE PAYMENT) ----------------
export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    // 1. Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ errors: "Course not found" });
    }

    // 2. Check if user already purchased this course
    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res
        .status(400)
        .json({ errors: "User has already purchased this course" });
    }

    // 3. Create Stripe Payment Intent
    const amount = Math.round(course.price * 100); // Convert to cents (for USD) or paise (for INR)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr", // Change to "inr" if you're using Indian Rupees
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { 
        userId: userId.toString(), 
        courseId: courseId.toString() 
      },
    });

    // 4. Return client secret to frontend (DON'T save purchase yet)
    res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      course: {
        _id: course._id,
        title: course.title,
        price: course.price,
        description: course.description,
        image: course.image
      },
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("[BUY COURSE] Error:", error);
    console.error("Error in initiating course purchase:", {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      success: false,
      errors: ["Error initiating course purchase" + error.message] 
    });
  }
};

// ---------------- CONFIRM PAYMENT (Webhook or separate endpoint) ----------------
export const confirmPayment = async (req, res) => {
  const { paymentIntentId, courseId, userId } = req.body;

  try {
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      console.log("[CONFIRM PAYMENT] Payment succeeded, saving purchase...");
      // Save purchase only after successful payment
      const newPurchase = new Purchase({ 
        userId, 
        courseId,
        paymentId: paymentIntentId,
        amount: paymentIntent.amount / 100, // Convert back to rupees
        status: 'completed'
      });
      await newPurchase.save();

      console.log("[CONFIRM PAYMENT] Purchase saved successfully");

      res.status(200).json({ 
        success: true,
        message: "Payment confirmed and course purchased successfully",
        purchase: newPurchase 
      });
    } else {
      console.log("[CONFIRM PAYMENT] Payment not completed. Status:", paymentIntent.status);

      res.status(400).json({ 
        success: false,
        errors: "Payment not completed successfully" 
      });
    }
  } catch (error) {
    console.error("[CONFIRM PAYMENT] Error:", error);
    console.error("Error confirming payment:", error);
    res.status(500).json({ errors: "Error confirming payment" });
  }
};
