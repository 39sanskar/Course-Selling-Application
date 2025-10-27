import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../../config.js";
import { Purchase } from "../models/purchase.model.js";
import { Course } from "../models/course.model.js";

// ---------------- SIGNUP ----------------
export const signup = async (req, res) => {
  const userSchema = z.object({
    firstName: z.string().min(3, { message: "FirstName must be at least 3 characters" }),
    lastName: z.string().min(3, { message: "LastName must be at least 3 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  });

  const validatedData = userSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({
      errors: validatedData.error.issues.map((err) => err.message),
    });
  }

  const { firstName, lastName, email, password } = validatedData.data;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ errors: ["User already exists"] });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: { id: newUser._id, firstName, lastName, email },
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ errors: ["Internal server error during signup"] });
  }
};

// ---------------- LOGIN ----------------
export const login = async (req, res) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const validated = loginSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({
      errors: validated.error.issues.map((err) => err.message),
    });
  }

  const { email, password } = validated.data;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(403).json({ errors: ["Invalid credentials"] });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(403).json({ errors: ["Invalid credentials"] });

    // jwt code
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "1d" });

    const cookieOptions={
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true, // our cookie can't be access via js directly.
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict", // prevent CSRF attack
    };
    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ errors: ["Internal server error during login"] });
  }
};

// ---------------- LOGOUT ----------------
export const logout = (req, res) => {
    try {
      if(!req.cookies.jwt){
      return res.status(401).json({ errors: "Kindly login first"}); 
      }
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({ errors: ["Internal server error during logout"] });
    }
};

// ---------------- GET PROFILE ----------------
export const getProfile = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ errors: ["User not found"] });

    res.status(200).json({ profile: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ errors: ["Internal server error while fetching profile"] });
  }
};

// ---------------- CHANGE PASSWORD ----------------
export const changePassword = async (req, res) => {
  const passwordSchema = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
  });

  const validated = passwordSchema.safeParse(req.body);
  if (!validated.success) {
    return res.status(400).json({ errors: validated.error.issues.map((err) => err.message) });
  }

  const { oldPassword, newPassword } = validated.data;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ errors: ["User not found"] });

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordCorrect) return res.status(403).json({ errors: ["Old password is incorrect"] });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ errors: ["Internal server error while changing password"] });
  }
};

// ---------------- GET PURCHASES ----------------
export const purchases = async (req, res) => {
  const userId = req.userId;

  try {
    // Get all purchase records for the user
    const purchasedRecords = await Purchase.find({ userId });

    // Extract course IDs from purchases
    const courseIds = purchasedRecords.map(record => record.courseId);

    // Fetch course details directly using the Course model
    const courses = await Course.find({ _id: { $in: courseIds } }).select("title price description image");

    res.status(200).json({ purchases: purchasedRecords, courses });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ errors: ["Internal server error while fetching purchases"] });
  }
};
