import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUsers, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import ThemeButton from '../components/ThemeButton';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 font-sans">
      <header className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-800 to-blue-600 shadow-xl px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaUsers className="text-xl sm:text-2xl text-white" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">ClassConnect</h1>
          </div>
          <Link to="/" className="text-sm sm:text-base text-white hover:text-blue-200 transition-colors">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex items-center justify-center py-8 sm:py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-blue-100"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 sm:mb-6 text-center">
            Welcome Back
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 text-red-600 rounded-lg text-sm"
              >
                {error.includes("verify") ? (
                  <>
                    {error}.{" "}
                    <Link to="/signup" className="underline font-medium">
                      Verify Now
                    </Link>
                  </>
                ) : error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-blue-700 mb-1 text-sm sm:text-base">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 text-sm sm:text-base rounded-lg border border-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-blue-700 mb-1 text-sm sm:text-base">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-4 py-2 text-sm sm:text-base rounded-lg border border-blue-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 outline-none transition pr-10"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 bottom-2.5 text-blue-400 hover:text-blue-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
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
                  Logging in...
                </span>
              ) : "Login"}
            </ThemeButton>

            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <Link 
                to="/signup" 
                className="text-xs sm:text-sm text-blue-600 hover:underline text-center sm:text-left"
              >
                Don't have an account? <span className="font-medium">Sign Up</span>
              </Link>
              <Link 
                to="/forgot-password" 
                className="text-xs sm:text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}