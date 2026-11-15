import express from "express";
import {
  login,
  logout,
  register,
  verifyEmail,
  verifyOtpController,
  resetPasswordController,
  sendResetOtp,
  checkAuth,
} from "../controllers/authController.js";
import { blockLoggedInUsers } from "../middleware/blockLoggedInUsers.js";
import { isLoggedIn } from "../middleware/isLoggedIn.js";
import { rateLimit } from "../middleware/rateLimiter.js";

const authRouter = express.Router();

const authRateLimiter = rateLimit({ prefix: "auth", maxAttempts: 10, windowMs: 15 * 60 * 1000 });
const otpRateLimiter = rateLimit({ prefix: "otp", maxAttempts: 5, windowMs: 15 * 60 * 1000 });

authRouter.post("/register", blockLoggedInUsers, authRateLimiter, register);
authRouter.post("/verify-email", blockLoggedInUsers, otpRateLimiter, verifyEmail);
authRouter.post("/login", blockLoggedInUsers, authRateLimiter, login);
authRouter.post("/logout", isLoggedIn, logout);
authRouter.post("/send-reset-otp", blockLoggedInUsers, otpRateLimiter, sendResetOtp);
authRouter.post("/verify-otp", blockLoggedInUsers, otpRateLimiter, verifyOtpController);
authRouter.post("/reset-password", blockLoggedInUsers, authRateLimiter, resetPasswordController);
authRouter.get("/check", isLoggedIn, checkAuth);

export default authRouter;
