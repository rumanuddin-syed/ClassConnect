import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import crypto from 'crypto';
import TempUser from '../models/tempUserModel.js';


export const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
      // Check existing verified user
      const existingVerified = await User.findOne({ email });
      if (existingVerified) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      // Generate OTP
      const otp = crypto.randomInt(100000, 999999).toString();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Handle existing temp user
      const existingTemp = await TempUser.findOne({ email });
      if (existingTemp) {
        existingTemp.otp = otp;
        existingTemp.otpExpires = otpExpires;
        existingTemp.password = hashedPassword;
        await existingTemp.save();
      } else {
        // Create new temp user
        await TempUser.create({
          name,
          email,
          password: hashedPassword,
          otp,
          otpExpires
        });
      }
  
      // Send OTP email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Verify Your Email',
        text: `Your verification OTP is: ${otp} (valid for 15 minutes)`
      };
  
      await transporter.sendMail(mailOptions);
      
      res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  export const verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // Find temp user
      const tempUser = await TempUser.findOne({ email });
      if (!tempUser) {
        return res.status(400).json({ success: false, message: "Invalid request" });
      }
  
      // Check OTP validity
      if (tempUser.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }
  
      if (tempUser.otpExpires < new Date()) {
        return res.status(400).json({ success: false, message: "OTP expired" });
      }
  
      // Create verified user
      const newUser = await User.create({
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        createdClasses: [],
        joinedClasses: [],
        attendanceRecords: [],
        resetOtp: '',
        resetOtpExpireAt: 0
      });
  
      // Delete temp user
      await TempUser.deleteOne({ email });
  
      // Generate JWT token
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  
      res.status(201).json({ 
        success: true, 
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// export const register = async (req, res) => {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//         return res.status(400).json({ success: false, message: "Missing Details" });
//     }
//     try {
        
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ success: false, message: "User already exists" });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({ name, email, password: hashedPassword });
//         await user.save();

//         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

//         res.cookie('token', token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000,
//         });

//         const mailOptions = {
//             from: process.env.SENDER_EMAIL,
//             to: email,
//             subject: 'Welcome to my project website',
//             text: `Welcome to the project website. Your account has been created with email id: ${email}`,
//         };

//         let info=await transporter.sendMail(mailOptions);
//         console.log(info);
//         res.status(201).json({ success: true });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ success: true, user: { id: user._id, name: user.name, email: user.email },token });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = String(Math.floor(Math.random() * 900000) + 100000);
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + (15 * 60 * 1000);
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account verification OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
        };

        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ✅ Verify OTP Controller
export const verifyOtpController = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP Expired" });
        }

        // ✅ OTP is valid, allow the user to proceed to reset password
        return res.json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ Reset Password Controller
export const resetPasswordController = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: "Email and newPassword are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // ✅ Hash and update the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password has been reset successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
