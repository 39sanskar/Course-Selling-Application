import { User } from "../models/user.model.js";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";

/*
Follow these steps to create an user controller.

1. signup
2. login
3. logout
4. getProfile 
5. changePassword
6. purchases 

*/

// ------------------ JWT HELPER ------------------
const generateUserToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: "user", 
    },
    config.JWT_USER_SECRET,
    { expiresIn: "1d" }
  );
};

// ------------------ SIGNUP ------------------
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userSchema = z.object({
    firstName: z.string().min(3, { message: "First name must be at least 3 characters" }),
    lastName: z.string().min(3, { message: "Last name must be at least 3 characters" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  });

  const validatedData = userSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ errors: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ errors: "Error in signup" });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(403).json({ errors: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(403).json({ errors: "Invalid credentials" });

    const token = generateUserToken(user);

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true,  
      secure: process.env.NODE_ENV === "production", 
      sameSite: "Strict", 
    });

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ errors: "Error in login" });
  }
};

// ------------------ LOGOUT ------------------
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ errors: "Error in logout" });
  }
};

// ------------------ GET PROFILE ------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // exclude password
    if (!user) return res.status(404).json({ errors: "User not found" });

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ errors: "Error fetching profile" });
  }
};

// ------------------ CHANGE PASSWORD ------------------
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const passwordSchema = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  });

  const validated = passwordSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ errors: validated.error.issues.map((err) => err.message) });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ errors: "User not found" });

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) return res.status(403).json({ errors: "Old password is incorrect" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ errors: "Error changing password" });
  }
};

// ------------------ PURCHASES ------------------
export const purchases = async (req, res) => {
  const userId = req.userId;

  try {
    const purchased = await Purchase.find({ userId });
    const purchasedCourseIds = purchased.map((p) => p.courseId);

    const courseData = await Course.find({ _id: { $in: purchasedCourseIds } });

    res.status(200).json({ purchased, courses: courseData });
  } catch (error) {
    console.error("Error in purchases:", error);
    res.status(500).json({ errors: "Error in fetching purchases" });
  }
};
