// server/middleware/blockLoggedInUsers.js
import jwt from "jsonwebtoken";

export const blockLoggedInUsers = (req, res, next) => {
  const token = req.cookies?.token;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(403).json({
        success: false,
        message: "Already logged in. Logout first.",
      });
    } catch (err) {
      // Token expired or invalid - allow access
      next();
    }
  } else {
    next();
  }
};
