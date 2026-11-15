import { useEffect } from "react";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./pages/SignupPage";
import Login from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";
import NewPassword from "./pages/NewPassword";
import Dashboard from "./pages/Dashboard";
import ClassDashboard from "./pages/ClassDashboard";
import NotFoundPage from "./components/NotFoundPage";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { useDispatch } from "react-redux";
import { checkAuthSession } from "./redux/slices/authSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Revalidate session with backend on application boot
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
        <Route path="/new-password" element={<NewPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/class/:classroomId"
          element={
            <ProtectedRoute>
              <ClassDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
