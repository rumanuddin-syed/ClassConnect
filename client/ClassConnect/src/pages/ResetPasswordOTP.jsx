import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthHeader from '../components/AuthHeader'
import OTPInput from '../components/OTPInput'
import ThemeButton from '../components/ThemeButton'
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp } from "../redux/slices/authSlice";
import { motion } from 'framer-motion';

export default function ResetPasswordOTP() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState("");
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (!storedEmail) {
      alert("No email found! Please request a reset OTP first.");
      navigate("/forgot-password");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  const handleOTPComplete = (code) => {
    setOtp(code);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter OTP.");
      return;
    }

    try {
      const response = await dispatch(verifyOtp({ email, otp: String(otp) }));
      if (response.meta.requestStatus === "fulfilled") {
        navigate('/new-password', { state: { email, otp } });
      }
    } catch (err) {
      console.error("OTP Verification Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 font-sans">
      {/* Responsive Header */}
      <AuthHeader title="Verify OTP" showBack />
      
      {/* Main Content - Mobile Optimized */}
      <main className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-100"
        >
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-2">Enter Verification Code</h2>
            <p className="text-sm sm:text-base text-blue-600 mb-4 sm:mb-6">
              We sent a 6-digit code to <span className="font-medium">{email || 'your email'}</span>
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <OTPInput 
                length={6} 
                onComplete={handleOTPComplete} 
                inputClassName="w-10 h-12 sm:w-12 sm:h-14 text-xl sm:text-2xl"
                containerClassName="gap-2 sm:gap-3"
              />
            </div>


            <ThemeButton 
              type="submit" 
              disabled={otp.length !== 6 || loading}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : "Verify Code"}
            </ThemeButton>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-green-50 text-green-600 rounded-lg text-sm text-center"
              >
                {success}
              </motion.div>
            )}

            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-600 hover:underline font-medium">
              Resend OTP 
              </Link>
            </div>
          </form>
        </motion.div>
      </main>

    </div>
  )
}