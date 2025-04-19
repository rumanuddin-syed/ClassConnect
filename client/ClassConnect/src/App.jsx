import './App.css'
import LandingPage from './pages/LandingPage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from './pages/SignupPage'
import Login from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPasswordOTP from './pages/ResetPasswordOTP';
import NewPassword from './pages/NewPassword';
import Dashboard from "./pages/Dashboard"
import ClassDashboard from './pages/ClassDashboard';
import NotFoundPage from './components/NotFoundPage';
function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path='/login' element={<Login/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/class/:classroomId" element={<ClassDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
      
    </>
  )
}

export default App
