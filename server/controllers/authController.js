import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import crypto from "crypto";
import TempUser from "../models/tempUserModel.js";

// Helper to sign unified JWT tokens with tokenVersion
export const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      tokenVersion: user.tokenVersion ?? 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Standard cookie settings
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const existingVerified = await User.findOne({ email });
    if (existingVerified) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists with this email" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingTemp = await TempUser.findOne({ email });
    if (existingTemp) {
      existingTemp.name = name;
      existingTemp.otp = otp;
      existingTemp.otpExpires = otpExpires;
      existingTemp.password = hashedPassword;
      await existingTemp.save();
    } else {
      await TempUser.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
      });
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Class Connect — Verify Your Email",
      text: `Welcome to Class Connect! Your verification OTP is: ${otp} (valid for 15 minutes).`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) {
      return res
        .status(400)
        .json({ success: false, message: "Registration session expired or invalid" });
    }

    if (tempUser.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (tempUser.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      createdClasses: [],
      joinedClasses: [],
      attendanceRecords: [],
      resetOtp: "",
      resetOtpExpireAt: 0,
      tokenVersion: 0,
    });

    await TempUser.deleteOne({ email });

    const token = signToken(newUser);

    // Set HttpOnly cookie
    res.cookie("token", token, getCookieOptions());

    res.status(201).json({
      success: true,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken(user);

    // Set secure HttpOnly cookie
    res.cookie("token", token, getCookieOptions());

    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // Invalidate user token version if user is identified
    if (req.user?.id) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -resetOtp -resetOtpExpireAt");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    user.resetOtpAttempts = 0; // Reset attempts count
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Class Connect — Password Reset OTP",
      text: `Your OTP for resetting your Class Connect password is: ${otp}. It is valid for 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Send reset OTP error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Verify OTP Controller - Validates OTP and returns a signed single-use reset token
export const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.resetOtpAttempts >= 5) {
      user.resetOtp = "";
      user.resetOtpExpireAt = 0;
      await user.save();
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. This OTP has been invalidated. Please request a new one.",
      });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    // Invalidate the OTP now that it has been verified (single use)
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    user.resetOtpAttempts = 0;
    await user.save();

    // Sign a short-lived, single-use reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        purpose: "password_reset",
        jti: crypto.randomBytes(16).toString("hex"),
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Verify reset OTP error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password Controller - Requires verified reset token
export const resetPasswordController = async (req, res) => {
  const { email, newPassword, resetToken } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Email and newPassword are required" });
  }

  if (!resetToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Verified reset token is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(resetToken, process.env.JWT_SECRET);
      if (decodedToken.email !== email || decodedToken.purpose !== "password_reset") {
        return res.status(401).json({ success: false, message: "Invalid reset token" });
      }
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Ensure reset token has a unique identifier (jti) and hasn't been reused
    const tokenIdentifier = decodedToken.jti || resetToken;
    if (user.usedResetTokens && user.usedResetTokens.includes(tokenIdentifier)) {
      return res.status(403).json({
        success: false,
        message: "This password reset token has already been used. Please request a new OTP.",
      });
    }

    // Hash and update the new password, increment tokenVersion to revoke all existing sessions
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    if (!user.usedResetTokens) user.usedResetTokens = [];
    user.usedResetTokens.push(tokenIdentifier);

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
