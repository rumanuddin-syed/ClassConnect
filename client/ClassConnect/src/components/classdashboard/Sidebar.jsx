import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  FaChalkboardTeacher, 
  FaUsers, 
  FaCalendarAlt, 
  FaComments, 
  FaHistory, 
  FaEnvelope,
  FaClipboardList,
  FaSignOutAlt,
  FaArrowLeft,
  FaTimes
} from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/slices/authSlice"; 
import { persistor } from "../../redux/store.js";

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, isMobile, setSidebarOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const tabs = [
    { id: "description", icon: <FaClipboardList />, label: "Description" },
    { id: "invitations", icon: <FaEnvelope />, label: "Invitations" },
    { id: "openChat", icon: <FaComments />, label: "Open Chat" },
    { id: "memories", icon: <FaHistory />, label: "Memories" },
    { id: "calendar", icon: <FaCalendarAlt />, label: "Calendar" },
    { id: "attendance", icon: <FaUsers />, label: "Attendance" }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      persistor.purge();
      dispatch(logoutUser());
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <motion.div 
      className={`w-64 bg-gradient-to-b from-blue-800 to-blue-600 shadow-xl text-white p-4 flex flex-col h-full ${
        isMobile ? "fixed inset-0 z-40" : "fixed h-full z-30 overflow-x-hidden"
      }`}
    >
      <div className="flex items-center  justify-between p-2  mb-4 border-b border-blue-400/30">
    <div className="flex items-center gap-3">
      <button 
        onClick={handleBackToDashboard}
        className="text-blue-200 hover:text-white transition-colors"
        title="Back to Dashboard"
      >
        <FaArrowLeft className="text-xl" />
      </button>
      <div className="flex items-center gap-2">
        <FaChalkboardTeacher className="text-2xl text-yellow-400" />
        <h1 className="text-xl font-bold whitespace-nowrap">ClassConnect</h1>
      </div>
    </div>
    
    {/* Always show close button (both mobile & desktop) */}
    <button 
      onClick={() => setSidebarOpen(false)}
      className="text-white hover:text-yellow-400 ml-1 transition-colors"
    >
      <FaTimes className="text-xl" />
    </button>
  </div>
        

  <nav className="flex-1 space-y-2 overflow-y-auto">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (isMobile) setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
              activeTab === tab.id 
                ? "bg-white/10 shadow-md border-l-4 border-yellow-400" 
                : "hover:bg-blue-700/50"
            }`}
            style={{
              willChange: 'transform',
              originX: 0
            }}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </motion.button>
        ))}
      </nav>


      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="mt-auto flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-700/50 text-red-200"
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </motion.button>
    </motion.div>
  );
};

export default Sidebar;