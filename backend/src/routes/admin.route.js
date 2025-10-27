import express from "express";
import {
  signup,
  login,
  logout,
  getProfile,
  changePassword,
  } from "../controllers/admin.controller.js";
import adminMiddleware from "../middlewares/admin.middleware.js";

const router = express.Router();

// ---------------- AUTH ROUTES ---------------- //

// Admin signup and login
router.post("/signup", signup);
router.post("/login", login);

// Logout (requires admin to be logged in)
router.get("/logout",  logout);

// ---------------- ADMIN PROFILE ---------------- //

// Get current admin profile
router.get("/profile", adminMiddleware, getProfile);

// Change password for admin
router.put("/changePassword", adminMiddleware, changePassword);

export default router;
