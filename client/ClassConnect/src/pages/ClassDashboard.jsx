import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import DescriptionTab from "../components/classdashboard/DescriptionTab";
import Sidebar from "../components/classdashboard/Sidebar";
import ToggleButton from "../components/classdashboard/ToggleButton";
import ChatTab from "../components/classdashboard/ChatTab";
import MemoriesTab from "../components/classdashboard/MemoriesTab";
import CalendarTab from "../components/classdashboard/CalendarTab";
import { FaChalkboardTeacher } from "react-icons/fa";
import AttendanceTab from "../components/classdashboard/AttendanceTab";
import InvitationsTab from "../components/classdashboard/InvitationsTab";
import { useParams, useNavigate } from "react-router-dom";
import { fetchClassroomDetails, resetClassroom } from "../redux/slices/classroomSlice";

const ClassDashboard = () => {
  const [activeTab, setActiveTab] = useState("description");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { classroomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { classroom, loading, error } = useSelector((state) => state.classroom);
  const { userId } = useSelector((state) => state.user);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const role = useMemo(() => {
    if (!classroom || !userId) return 'none';
    if (userId === classroom.adminId) return 'admin';
    if (classroom.teachers.some(teacher => teacher.userId === userId)) return 'teacher';
    if (classroom.students.some(student => student.userId === userId)) return 'student';
    return 'none';
  }, [classroom, userId]);

  useEffect(() => {
    if (!classroomId) {
      navigate('/dashboard');
      return;
    }
    
    dispatch(fetchClassroomDetails(classroomId));
  
    return () => {
      dispatch(resetClassroom());
    };
  }, [dispatch, classroomId, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md mx-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Failed to load classroom: {error}</p>
            <button onClick={() => navigate('/dashboard')} className="mt-2 text-sm text-blue-600 hover:underline">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>;
  }

  if (!classroom) {
    return <div className="flex justify-center items-center h-screen">
      <div className="p-4 text-yellow-700 max-w-md text-center">
        <p>No classroom data available</p>
        <button onClick={() => navigate('/dashboard')} className="mt-2 text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </button>
      </div>
    </div>;
  }

  const classInfo = {
    className: classroom.name,
    adminName: classroom.adminName,
    description: classroom.description
  };

  const students = classroom.students || [];
  const teachers = classroom.teachers || [];
  const subjects = classroom.subjects || [];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 overflow-hidden">
      
      <ToggleButton 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        isMobile={isMobile}
      />
      
      <AnimatePresence>
        {sidebarOpen && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
            setSidebarOpen={setSidebarOpen}
          />
        )}
      </AnimatePresence>

      <div 
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-4 md:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white rounded-xl ${isMobile ? "mt-4":"mt-0"} md:rounded-3xl shadow-lg md:shadow-xl p-1 md:p-1 min-h-[calc(100vh-4rem)] border-2 border-blue-100`}
          >
            {activeTab === "description" ? (
              <DescriptionTab role={role} classInfo={classInfo} students={students} teachers={teachers} subjects={subjects} />
            ) : activeTab === "openChat" ? (
              <ChatTab role={role} />
            ) : activeTab === "memories" ? (
              <MemoriesTab role={role} />
            ) : activeTab === "calendar" ? (
              <CalendarTab role={role} />
            ) : activeTab === "attendance" ? (
              <AttendanceTab role={role} />
            ) : activeTab === 'invitations' ? (
              <InvitationsTab role={role} />
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-12rem)] text-blue-400">
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 capitalize">{activeTab} Tab</h2>
                  <p className="text-blue-600">Content for {activeTab} will appear here</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

    </div>
  );
};

export default ClassDashboard;