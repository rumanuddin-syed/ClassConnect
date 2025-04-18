import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserClasses,
  createNewClass,
  requestJoinClass,
  editClass,
  deleteClass,
  resetActionStatus,
  clearClassError
} from '../redux/slices/classSlice';
import { fetchUserData } from '../redux/slices/userSlice';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardActions from '../components/dashboard/DashboardActions';
import ClassTabs from '../components/dashboard/ClassTabs';
import ClassCard from '../components/dashboard/ClassCard';
import EmptyState from '../components/shared/EmptyState';
import CreateClassForm from '../components/dashboard/CreateClassForm';
import EditClassForm from '../components/dashboard/EditClassForm';
import JoinClassForm from '../components/dashboard/JoinClassForm';
import DeleteConfirmation from '../components/dashboard/DeleteConfirmation';
import {  useNavigate } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // State declarations
  const [activeTab, setActiveTab] = useState('created');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // Profile dropdown state
  const [selectedClass, setSelectedClass] = useState(null);
  const profileRef = useRef(null);


  // Redux state
  const { user } = useSelector((state) => state.auth);
  const {
    userClasses,
    loading: classesLoading,
    error: classesError,
    actionStatus
  } = useSelector((state) => state.classes);
  const {
    userId,
    name,
    email,
    createdClassesCount,
    joinedClassesCount,
    loading: userLoading,
    error: userError
  } = useSelector((state) => state.user);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchUserData());
    if (user?.id) dispatch(fetchUserClasses());
  }, [dispatch, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearClassError());
      dispatch(resetActionStatus());
    };
  }, [dispatch]);

  // Filter classes based on search
  const filteredClasses = {
    created: userClasses.created.filter(cls =>
      cls.className.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    joined: userClasses.joined.filter(cls =>
      cls.className.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };


  // Class handlers
  const handleCreateClass = (classData) => {
    dispatch(createNewClass(classData))
      .unwrap()
      .then(() => {
        setShowCreateForm(false);
        dispatch(fetchUserClasses());
      });
  };

  const handleEditClass = (classData) => {
    dispatch(editClass({ classId: selectedClass.classId, ...classData }))
      .unwrap()
      .then(() => {
        setShowEditForm(false);
        dispatch(fetchUserClasses());
      });
  };

  const handleDeleteClass = () => {
    dispatch(deleteClass(selectedClass.classId))
      .unwrap()
      .then(() => {
        setShowDeleteDialog(false);
        dispatch(fetchUserClasses());
      });
  };

  const handleJoinClass = (joinData) => {
    dispatch(requestJoinClass(joinData))
      .unwrap()
      .then(() => {
        setShowJoinForm(false);
        dispatch(fetchUserClasses());
      });
  };

  const handleViewClass = (classId) => {
    navigate(`/class/${classId}`);
  };
  // Loading and error states
  if (userLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (userError || classesError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-xl">
          {userError || classesError}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100">
      <DashboardHeader>
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 focus:outline-none p-2 rounded-full hover:bg-blue-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">
                {name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-gray-700 font-medium hidden md:inline">
              {name}
            </span>
          </button>

          {/* Profile dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 border"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold truncate">{name}</h3>
                      <p className="text-sm text-gray-600 truncate">{email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created Classes:</span>
                      <span>{createdClassesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Joined Classes:</span>
                      <span>{joinedClassesCount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardHeader>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 text-white rounded-xl p-6 mb-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-2">Welcome back, {name}!</h2>
          <p className="opacity-90">
            Managing {createdClassesCount} classes and enrolled in {joinedClassesCount} courses
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search classes..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <DashboardActions 
          onCreate={() => setShowCreateForm(true)} 
          onJoin={() => setShowJoinForm(true)} 
        />

        {/* Class Tabs */}
        <ClassTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Class Grid */}
        {filteredClasses[activeTab].length > 0 ? (
          <motion.div 
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredClasses[activeTab].map(cls => (
                <ClassCard 
                  key={cls.classId} 
                  cls={cls} 
                  type={activeTab}
                  onView={handleViewClass}
                  onEdit={() => {
                    setSelectedClass(cls);
                    setShowEditForm(true);
                  }}
                  onDelete={() => {
                    setSelectedClass(cls);
                    setShowDeleteDialog(true);
                  }}
                />
              ))}
          </motion.div>
        ) : (
          <EmptyState
            type={activeTab}
            onAction={activeTab === 'created' 
              ? () => setShowCreateForm(true) 
              : () => setShowJoinForm(true)}
            searchQuery={searchQuery}
          />
        )}

        {/* Modals */}
        <AnimatePresence>
          {showCreateForm && (
            <CreateClassForm
              onClose={() => setShowCreateForm(false)}
              onCreate={handleCreateClass}
              loading={actionStatus === 'loading'}
            />
          )}
          
          {showEditForm && (
            <EditClassForm
              initialData={selectedClass}
              onClose={() => setShowEditForm(false)}
              onSubmit={handleEditClass}
              loading={actionStatus === 'loading'}
            />
          )}
          
          {showJoinForm && (
            <JoinClassForm
              onClose={() => setShowJoinForm(false)}
              onSubmit={handleJoinClass}
              status={actionStatus}
            />
          )}
          
          {showDeleteDialog && (
            <DeleteConfirmation
              className={selectedClass?.className}
              onClose={() => setShowDeleteDialog(false)}
              onConfirm={handleDeleteClass}
              loading={actionStatus === 'loading'}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}