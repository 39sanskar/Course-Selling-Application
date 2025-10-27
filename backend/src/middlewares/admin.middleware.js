import jwt from "jsonwebtoken";
import config from "../../config.js";

const adminMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for valid Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        errors: ["No token provided"],
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        errors: ["Invalid token format"],
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Validate payload
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        errors: ["Invalid token payload"],
      });
    }

    // Attach admin data to request object
    req.adminId = decoded.id;
    req.isAdmin = true;

    if (decoded.email) req.adminEmail = decoded.email;
    if (decoded.firstName) req.adminFirstName = decoded.firstName;

    next();

  } catch (error) {
    console.error("Admin middleware error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        errors: ["Token expired"],
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        errors: ["Invalid token"],
      });
    }

    return res.status(401).json({
      success: false,
      errors: ["Authentication failed"],
    });
  }
};

export default adminMiddleware;
