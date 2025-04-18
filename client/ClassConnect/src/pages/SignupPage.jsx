import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChalkboardTeacher, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, verifyEmailOtp } from '../redux/slices/authSlice';
import ThemeButton from '../components/ThemeButton';

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, registrationOtpSent } = useSelector((state) => state.auth);

  const handleRegistration = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }
    dispatch(registerUser(form));
  };

  const handleOtpVerification = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }
    dispatch(verifyEmailOtp({ email: form.email, otp }));
    navigate('/login')
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 font-sans">
      <header className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-800 to-blue-600 shadow-xl px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaChalkboardTeacher className="text-xl sm:text-2xl text-white" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">ClassConnect</h1>
          </div>
          <Link to="/" className="text-sm sm:text-base text-white hover:text-blue-200 transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-100"
        >
          {!registrationOtpSent ? (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">
                Create Your Account
              </h2>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleRegistration} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm sm:text-base text-blue-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm sm:text-base text-blue-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm sm:text-base text-blue-700 mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition pr-10"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 bottom-2.5 text-blue-400 hover:text-blue-600"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                  </button>
                </div>

                <ThemeButton 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 text-sm sm:text-base mt-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : "Get Verification OTP"}
                </ThemeButton>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">
                Verify Your Email
              </h2>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleOtpVerification} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit code to<br/>
                    <span className="font-medium text-blue-700">{form.email}</span>
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      required
                      className="w-12 h-12 text-2xl text-center border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // Only allow numbers
                        const newOtp = otp.split("");
                        newOtp[index] = value;
                        setOtp(newOtp.join(""));
                        
                        // Auto focus next input
                        if (value && index < 5) {
                          const nextInput = document.getElementById(`otp-${index + 1}`);
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace
                        if (e.key === 'Backspace' && !otp[index] && index > 0) {
                          const prevInput = document.getElementById(`otp-${index - 1}`);
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      id={`otp-${index}`}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  ))}
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
                      Verifying...
                    </span>
                  ) : "Verify Account"}
                </ThemeButton>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={handleRegistration}
                    className="text-blue-600 hover:underline"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-blue-600">
            <p>By signing up, you agree to our <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a></p>
          </div>

          {!registrationOtpSent && (
            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs sm:text-sm text-blue-600 hover:underline font-medium">
                Already have an account? Login
              </Link>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}