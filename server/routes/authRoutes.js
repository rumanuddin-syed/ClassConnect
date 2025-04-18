import express from 'express'
import { login, logout,  register, verifyEmail,verifyOtpController,resetPasswordController , sendResetOtp } from '../controllers/authController.js';
import { blockLoggedInUsers } from '../middleware/blockLoggedInUsers.js';

const authRouter = express.Router();

authRouter.post('/register',blockLoggedInUsers,register);
authRouter.post('/verify-email',blockLoggedInUsers, verifyEmail);
authRouter.post('/login',blockLoggedInUsers,login);
authRouter.post('/logout',blockLoggedInUsers,logout);
authRouter.post('/send-reset-otp',blockLoggedInUsers,sendResetOtp);
authRouter.post("/verify-otp",blockLoggedInUsers, verifyOtpController);
authRouter.post("/reset-password",blockLoggedInUsers, resetPasswordController);

export default authRouter; 