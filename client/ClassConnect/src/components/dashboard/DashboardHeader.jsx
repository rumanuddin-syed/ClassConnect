import { FaChalkboardTeacher, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import {  useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice"; 
import { persistor } from "../../redux/store";

export default function DashboardHeader({ children }) {
  const navigate = useNavigate()
  const dispatch = useDispatch();



  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      persistor.purge();
      dispatch(logoutUser());
    }
  }

  return (
    <header className="w-full py-4 bg-gradient-to-r from-blue-800 to-blue-600 shadow-xl px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaChalkboardTeacher className="text-2xl text-white" />
          <h1 className="text-2xl font-black text-white tracking-tight">ClassConnect</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          {children}
          
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 text-white hover:text-blue-200 transition-colors"
          >
            <FaSignOutAlt />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}