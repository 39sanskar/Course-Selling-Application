import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../config.js";
import { Admin } from "../models/admin.model.js";


/*
Follow these steps to create an admin controller.

1. signup
2. login
3. logout
4. changePassword
5. getProfile

*/


// Utility: generate JWT
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: "admin",
    },
    config.JWT_ADMIN_SECRET, // rename from PASSWORD to SECRET
    { expiresIn: "1d" }
  );
};

// Signup controller
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const adminSchema = z.object({
    firstName: z.string().min(3, { message: "First name must be at least 3 chars" }),
    lastName: z.string().min(3, { message: "Last name must be at least 3 chars" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be at least 6 chars" }),
  });

  const validatedData = adminSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res
      .status(400)
      .json({ errors: validatedData.error.issues.map((err) => err.message) });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ errors: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Signup successful", admin: newAdmin });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ errors: "Error in signup" });
  }
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(admin);

    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, // cannot be accessed by JS directly
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "Strict", // CSRF protection
    };

    res.cookie("jwt", token, cookieOptions);
    res.status(200).json({ message: "Login successful", admin, token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ errors: "Error in login" });
  }
};

// Logout controller
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ errors: "Error in logout" });
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.admin.id); // req.admin set in middleware
    if (!admin) return res.status(404).json({ errors: "Admin not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ errors: "Old password incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ errors: "Error changing password" });
  }
};

// Get current admin profile
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ errors: "Admin not found" });

    res.json({ admin });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ errors: "Error fetching profile" });
  }
};

