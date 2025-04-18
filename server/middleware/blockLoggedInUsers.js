// middleware/auth.js
import  jwt from 'jsonwebtoken';

export const blockLoggedInUsers = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(403).json({ 
        success: false,
        message: "Already logged in. Logout first." 
      });
    } catch (err) {
      // Token expired/invalid - allow access to login
      next();
    }
  } else {
    next(); // No token - proceed to login
  }
};

// Apply to login route
