import express from "express";
import {
    signup,
    login,
    logout,
    getProfile,
    changePassword,
    purchases,
} from "../controllers/user.controller.js";
import userMiddleware from "../middlewares/user.middleware.js";

const router = express.Router();

// ---------------- AUTH ----------------
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

// ---------------- USER PROFILE ----------------
router.get("/profile", userMiddleware, getProfile);
router.put("/changePassword", userMiddleware, changePassword);

// ---------------- PURCHASES ----------------
router.get("/purchases", userMiddleware, purchases);

export default router;
