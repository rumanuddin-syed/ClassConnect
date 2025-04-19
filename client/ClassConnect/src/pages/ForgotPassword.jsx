import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthHeader from '../components/AuthHeader'
import ThemeButton from '../components/ThemeButton'
import { useDispatch, useSelector } from "react-redux";
import { sendResetOtp, clearState } from "../redux/slices/authSlice";
import { motion } from 'framer-motion'; // Add this line
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const { loading, error, resetOtpSent } = useSelector((state) => state.auth);
  const { token } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      alert("Please enter your email.");
      return;
    }
  
    try {
      const response = await dispatch(sendResetOtp(email));
      if (response.meta.requestStatus === "fulfilled") {
        localStorage.setItem("resetEmail", email);
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
    }
  }

  useEffect(() => {
    if (resetOtpSent) {
      navigate("/reset-password-otp", { state: { email } });
      dispatch(clearState());
    }
  }, [resetOtpSent, navigate, dispatch, email]);

  useEffect(() => {
    if (token) {
      navigate("/dashboard");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 font-sans">
      {/* Responsive Header */}
      <AuthHeader title="Forgot Password" showBack />
      
      {/* Main Content - Mobile Optimized */}
      <main className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-100">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-2">Forgot Password?</h2>
            <p className="text-sm sm:text-base text-blue-600 mb-4 sm:mb-6">
              Enter your email to receive a reset code
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm sm:text-base text-blue-700 mb-1 sm:mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border-2 border-blue-100 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <ThemeButton 
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending OTP...
                </span>
              ) : "Send OTP"}
            </ThemeButton>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="text-center pt-4 border-t border-blue-100 mt-4">
              <p className="text-xs sm:text-sm text-blue-600">
                Remember your password?{' '}
                <a 
                  href="/login" 
                  className="font-medium text-blue-700 hover:underline"
                >
                  Login here
                </a>
              </p>
            </div>
          </form>
        </div>
      </main>

    </div>
  )
}