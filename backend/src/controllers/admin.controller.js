import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import config from "../../config.js";
import { Admin } from "../models/admin.model.js";

/*
Follow these steps to create an admin controller.

1. signup
2. login
3. logout
4. getProfile
5. changePassword

*/

// ---- Signup ----
export const signup = async (req, res) => {
  const adminSchema = z.object({
    firstName: z.string().min(3, { message: "First name must be at least 3 characters long" }),
    lastName: z.string().min(3, { message: "Last name must be at least 3 characters long" }),
    email: z.string().email(),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  });

  const validatedData = adminSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({
      errors: validatedData.error.issues.map((err) => err.message),
    });
  }

  const { firstName, lastName, email, password } = validatedData.data;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ errors: ["Admin already exists"] });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Signup succeeded",
      admin: {
        id: newAdmin._id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ errors: ["Internal server error during signup"] });
  }
};

// ---- Login ----
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
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(403).json({ errors: ["Invalid email or password"] });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: ["Invalid email or password"] });
    }

    // jwt code 
    const token = jwt.sign(
      { id: admin._id },
      config.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // cookie setup
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.cookie("jwt", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ errors: ["Internal server error during login"] });
  }
};

// ---- Logout ----
export const logout = (req, res) => {
  
  try {
    if (!req.cookies.jwt) {
      return res.status(401).json({ errors: " Kindly login first"});
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

// ---- Get Profile ----
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) {
      return res.status(404).json({ errors: ["Admin not found"] });
    }
    res.status(200).json({ admin });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ errors: ["Internal server error while fetching profile"] });
  }
};

// ---- Change Password ----
export const changePassword = async (req, res) => {
  
  const passwordSchema = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters long" }),
  });

  const validatedData = passwordSchema.safeParse(req.body);
  if (!validatedData.success) {
    return res.status(400).json({
      errors: validatedData.error.issues.map((err) => err.message),
    });
  }

  const { oldPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ errors: ["Admin not found"] });
    }

    const isPasswordCorrect = await bcrypt.compare(oldPassword, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ errors: ["Old password is incorrect"] });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ errors: ["Internal server error while changing password"] });
  }
};
