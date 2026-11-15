// server/middleware/isLoggedIn.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    // Strictly cookie-based authentication
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify token version against current database user record for active revocation
    const user = await User.findById(decoded.id).select("tokenVersion");
    if (!user) {
      return res.status(401).json({ message: "User account no longer exists." });
    }

    const currentTokenVersion = user.tokenVersion ?? 0;
    const tokenVersionInPayload = decoded.tokenVersion ?? 0;

    if (currentTokenVersion !== tokenVersionInPayload) {
      return res.status(401).json({ message: "Token has been revoked or invalidated. Please login again." });
    }

    req.user = decoded; // { id, email, name, tokenVersion, iat, exp }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
