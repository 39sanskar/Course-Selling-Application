import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import orderRoute from "./routes/order.route.js";


dotenv.config();

const app = express();


// ==================== MIDDLEWARE ====================
// fileUpload must come before express.json()

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ==================== FIXED CORS CONFIGURATION ====================
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ADDED OPTIONS
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  optionsSuccessStatus: 200 // Important for some browsers
};

app.use(cors(corsOptions));


// EXPLICITLY HANDLE OPTIONS REQUESTS FOR ALL ROUTES
// app.options("/*", cors(corsOptions));


// ==================== CLOUDINARY CONFIG ====================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==================== ROUTES ====================
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/order", orderRoute);


// ==================== HEALTH CHECK ====================
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "API is running",
    cors: {
      origin: req.headers.origin,
      allowed: true
    }
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ 
      error: "CORS Error", 
      message: "Origin not allowed",
      yourOrigin: req.headers.origin
    });
  }

  res.status(500).json({ error: "Internal server error" });
});

export { app }
