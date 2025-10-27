import express from "express";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourses,
  courseDetails, 
  buyCourses,
} from "../controllers/course.controller.js";
import adminMiddleware from "../middlewares/admin.middleware.js";
import userMiddleware from "../middlewares/user.middleware.js";


const router = express.Router();

// ---------------- ADMIN ROUTES ---------------- //

// Create a new course
router.post("/create", adminMiddleware , createCourse);

// Update an existing course
router.put("/update/:courseId", adminMiddleware , updateCourse);

// Delete a course
router.delete("/delete/:courseId", adminMiddleware ,  deleteCourse);

// ---------------- PUBLIC ROUTES ---------------- //

// Get all courses (supports pagination, search)
router.get("/courses", getCourses);

// Get single course details by ID
router.get("/:courseId", courseDetails);

// ---------------- USER ROUTES ----------------
router.post("/buy/:courseId", userMiddleware, buyCourses);


export default router;
