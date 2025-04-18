import { FaUsers, FaChalkboardTeacher, FaBook } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from "react-router-dom";
import {
  fetchAnnouncements,
  addNewAnnouncement,
  updateExistingAnnouncement,
  deleteExistingAnnouncement
} from '../../redux/slices/announcementSlice';
import { fetchClassroomDetails,removeClassMember } from "../../redux/slices/classroomSlice";
import {
  addSubject,
  updateSubject,
  deleteSubject
} from '../../redux/slices/subjectSlice';

const DescriptionTab = ({ role, classInfo, students, teachers,subjects }) => {
  const dispatch = useDispatch();
  const { announcements, loading, error } = useSelector((state) => state.announcements);
  const { 
    status: subjectsStatus, 
    error: subjectsError,
    operation: subjectsOperation 
  } = useSelector((state) => state.subjects);
  const { classroomId } = useParams();
  const { userId } = useSelector((state) => state.user);

  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementText, setAnnouncementText] = useState("");
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectName, setSubjectName] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  useEffect(() => {
    dispatch(fetchAnnouncements(classroomId));
  }, [dispatch, classroomId]);

  const handleAddAnnouncement = async () => {
    try {
      await dispatch(addNewAnnouncement({ classId: classroomId, text: announcementText })).unwrap();
      setShowAnnouncementForm(false);
      setAnnouncementText("");      dispatch(fetchClassroomDetails(classroomId));
      dispatch(fetchAnnouncements(classroomId));

    } catch (error) {
      console.error("Failed to add announcement:", error);
    }
  };

  const handleEditAnnouncement = async () => {
    try {
      await dispatch(updateExistingAnnouncement({
        announcementId: editingAnnouncement.id,
        classroomId,
        text: announcementText
      })).unwrap();
      setEditingAnnouncement(null);
      setAnnouncementText("");
      dispatch(fetchAnnouncements(classroomId));
    } catch (error) {
      console.error("Failed to update announcement:", error);
    }
  };

  const handleDeleteMember = async (userIdToDelete) => {
    try {
      await dispatch(removeClassMember({ 
        classroomId, 
        userId: userIdToDelete 
      })).unwrap();
      dispatch(fetchClassroomDetails(classroomId));
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await dispatch(deleteExistingAnnouncement({
        announcementId,
        classroomId
      })).unwrap();
      dispatch(fetchAnnouncements(classroomId));
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const handleAddSubject = async () => {
    try {
      await dispatch(addSubject({
        name: subjectName,
        teacherId: role === "admin" ? selectedTeacherId : userId,
        classId: classroomId
      })).unwrap();
      
      setShowSubjectForm(false);
      setSubjectName("");
      setSelectedTeacherId(null);
      dispatch(fetchClassroomDetails(classroomId));

    } catch (error) {
      console.error("Failed to add subject:", error);
    }
  };

  const handleEditSubject = async () => {
    try {
      await dispatch(updateSubject({
        subjectId: editingSubject.subjectId,
        name: subjectName,
        teacherId: role === "admin" ? (selectedTeacherId||null) : userId,
        classroomId
      })).unwrap();
      
      setEditingSubject(null);
      setSubjectName("");
      setSelectedTeacherId(null);
      setShowSubjectForm(false);
      dispatch(fetchClassroomDetails(classroomId));

    } catch (error) {
      console.error("Failed to update subject:", error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      await dispatch(deleteSubject({ subjectId, classroomId })).unwrap();
      dispatch(fetchClassroomDetails(classroomId));

    } catch (error) {
      console.error("Failed to delete subject:", error);
    }
  };

  const startEditing = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementText(announcement.text);
  };

  const startEditingSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectName(subject.name);
    setSelectedTeacherId(subject.teacher);
    setShowSubjectForm(true);
  };

  const isLoading = (operation) => subjectsStatus === 'loading' && subjectsOperation === operation;

    return (
    <div className="space-y-6 p-2 md:space-y-8 md:p-4">
      {/* Class Info & Announcements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Class Description */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm md:shadow-md border border-blue-100">
          <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-2">{classInfo.className}</h2>
          <p className="text-sm md:text-base text-blue-600 mb-3">Admin: <span className="font-semibold">{classInfo.adminName}</span></p>
          <div className="prose max-w-none text-sm md:text-base text-blue-700">
            <p>{classInfo.description}</p>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm md:shadow-md border border-blue-100">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h3 className="text-lg md:text-xl font-bold text-blue-900">Announcements</h3>
            {(role === "admin" || role === "teacher") && (
              <button 
                className="text-blue-600 hover:text-blue-800 p-1"
                onClick={() => {
                  setShowAnnouncementForm(true);
                  setEditingAnnouncement(null);
                  setAnnouncementText("");
                }}
              >
                <svg className="h-5 w-5"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg>
              </button>
            )}
          </div>
          
          {(showAnnouncementForm || editingAnnouncement) && (
            <div className="mb-4 p-3 md:p-4 bg-blue-50 rounded-lg">
              <textarea
                className="w-full p-2 text-sm md:text-base border border-blue-200 rounded mb-2"
                rows="3"
                placeholder="Enter announcement text..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={() => {
                    setShowAnnouncementForm(false);
                    setEditingAnnouncement(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={editingAnnouncement ? handleEditAnnouncement : handleAddAnnouncement}
                >
                  {editingAnnouncement ? "Update" : "Post"}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {announcements.map(announcement => (
              <div key={announcement.id} className="p-3 md:p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <p className="text-sm md:text-base font-medium text-blue-800">{announcement.text}</p>
                  {(role === "admin" || (role === "teacher" && !announcement.isAdmin)) && (
                    <div className="flex gap-2 ml-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => startEditing(announcement)}
                      >
                        <svg className="h-4 w-4"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                      </button>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        <svg className="h-4 w-4"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" /></svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs md:text-sm text-blue-500 mt-1">
                  {announcement.author} • {new Date(announcement.date).toLocaleDateString()}
                  {announcement.isAdmin && " • Admin"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Students & Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Students List */}
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm md:shadow-md border border-blue-100">
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-3 md:mb-4">
            Students ({students.length})
          </h3>
          <div className="space-y-2 md:space-y-3">
            {students.map(student => (
              <div key={student.userId} className="flex items-center p-2 md:p-3 hover:bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaUsers className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium text-blue-800 truncate">{student.name}</p>
                  <p className="text-xs md:text-sm text-blue-500 truncate">{student.email}</p>
                </div>
                {role === "admin" && (
                  <button 
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={() => handleDeleteMember(student.userId)}
                  >
                    <svg className="h-4 w-4">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Teachers List */}
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm md:shadow-md border border-blue-100">
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-3 md:mb-4">
            Teachers ({teachers.length})
          </h3>
          <div className="space-y-2 md:space-y-3">
            {teachers.map(teacher => (
              <div key={teacher.userId} className="flex items-center p-2 md:p-3 hover:bg-blue-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaChalkboardTeacher className="text-blue-600 text-sm md:text-base" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium text-blue-800 truncate">{teacher.name}</p>
                  <p className="text-xs md:text-sm text-blue-500 truncate">{teacher.email}</p>
                </div>
                {role === "admin" && (
                  <button 
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={() => handleDeleteMember(teacher.userId)}
                  >
                    <svg className="h-4 w-4">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Subjects Section */}
      <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm md:shadow-md border border-blue-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
          <h3 className="text-lg md:text-xl font-bold text-blue-900">
            Subjects ({subjects.length})
            {isLoading('fetch') && <span className="ml-2 text-xs md:text-sm text-blue-500">Loading...</span>}
          </h3>
          
          {(role === "admin" || role === "teacher") && (
            <button 
              className="text-sm md:text-base bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 flex items-center justify-center gap-1"
              onClick={() => {
                setShowSubjectForm(true);
                setEditingSubject(null);
                setSubjectName("");
                setSelectedTeacherId(null);
              }}
              disabled={isLoading('add')}
            >
              <svg className="h-4 w-4 md:h-5 md:w-5"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg>
              {isLoading('add') ? 'Adding...' : 'Add Subject'}
            </button>
          )}
        </div>

        {/* Subject Form */}
        {(showSubjectForm || editingSubject) && (
          <div className="mb-4 p-3 md:p-4 bg-blue-50 rounded-lg">
            <input
              type="text"
              className="w-full p-2 text-sm md:text-base border border-blue-200 rounded mb-2"
              placeholder="Subject name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              disabled={isLoading('add') || isLoading('update')}
            />
            
            {role === "admin" && (
              <select
                className="w-full p-2 text-sm md:text-base border border-blue-200 rounded mb-2"
                value={selectedTeacherId || ""}
                onChange={(e) => setSelectedTeacherId(e.target.value || null)}
                disabled={isLoading('add') || isLoading('update')}
              >
                <option value="">Unassigned</option>
                {teachers.map((teacher) => (
                  <option key={teacher.userId} value={teacher.userId}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowSubjectForm(false);
                  setEditingSubject(null);
                }}
                disabled={isLoading('add') || isLoading('update')}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={editingSubject ? handleEditSubject : handleAddSubject}
                disabled={isLoading('add') || isLoading('update')}
              >
                {isLoading(editingSubject ? 'update' : 'add') ? 'Processing...' : 
                 (editingSubject ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        )}

        {/* Subjects Table */}
        {subjectsError && (
          <div className="mb-4 p-2 text-xs md:text-sm bg-red-100 text-red-700 rounded">
            {subjectsError}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-blue-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-blue-500 uppercase">Subject</th>
                <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs md:text-sm font-medium text-blue-500 uppercase">Teacher</th>
                {(role === "admin" || role === "teacher") && (
                  <th className="px-4 py-2 md:px-6 md:py-3 text-right text-xs md:text-sm font-medium text-blue-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-200">
              {subjects.map((subject) => (
                <tr key={subject.subjectId} className="hover:bg-blue-50">
                  <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <FaBook className="text-blue-600 text-sm md:text-base" />
                      </div>
                      <div className="text-sm md:text-base font-medium text-blue-800">{subject.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm md:text-base text-blue-500">
                    {subject.teacher?.teacherName || 'Unassigned'}
                  </td>
                  {(role === "admin" || role === "teacher") && (
                    <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-sm md:text-base font-medium">
                      {(role === "admin" || subject.teacher?.teacherId === userId) && (
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => startEditingSubject(subject)}
                            disabled={isLoading('update') || isLoading('delete')}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteSubject(subject.subjectId)}
                            disabled={isLoading('delete')}
                          >
                            {isLoading('delete') ? 'Deleting...' : 'Remove'}
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DescriptionTab;