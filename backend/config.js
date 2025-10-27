import dotenv from "dotenv";
dotenv.config();

const { 
  JWT_SECRET,  // Use JWT_SECRET instead of separate ones
  STRIPE_SECRET_KEY 
} = process.env;

// Basic validation to ensure all required environment variables are set
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in .env");
if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not defined in .env");

export default {
  JWT_SECRET,  // Export single secret
  STRIPE_SECRET_KEY,
};
