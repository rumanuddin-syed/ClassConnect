import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaCheck, FaTimes, FaEdit, FaTrash, FaPlus, 
  FaCalendarAlt, FaList, FaEye, FaSpinner,
  FaChevronLeft, FaSearch
} from 'react-icons/fa';
import { 
  fetchAttendance, 
  addAttendance, 
  editAttendance, 
  deleteAttendanceRecord 
} from '../../redux/slices/attendanceSlice';

const DateInputField = ({ value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(value || Date.now()));
  const pickerRef = useRef(null);

  // Corrected useMemo declarations
  const months = useMemo(() => 
    Array.from({ length: 12 }, (_, i) => 
      new Date(0, i).toLocaleString('default', { month: 'long' })
    ), 
  []);

  const years = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => 2000 + i),
  []);

  const days = useMemo(() => 
    Array.from({ length: 31 }, (_, i) => i + 1),
  []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowPicker(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateDate = (field, value, e) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const newDate = new Date(selectedDate);
    
    if (field === 'month') newDate.setMonth(months.indexOf(value));
    if (field === 'day') newDate.setDate(parseInt(value));
    if (field === 'year') newDate.setFullYear(parseInt(value));

    const lastDay = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    if (newDate.getDate() > lastDay) newDate.setDate(lastDay);

    setSelectedDate(newDate);
    onChange(newDate.toISOString().split('T')[0]);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <input
        type="text"
        value={selectedDate.toISOString().split('T')[0]}
        readOnly
        className="w-full p-2 pr-8 border rounded-lg bg-gray-50 text-sm cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          setShowPicker(!showPicker);
        }}
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          setShowPicker(!showPicker);
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-600"
      >
        <FaCalendarAlt className="text-sm" />
      </button>

      {showPicker && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-xl z-50 p-4 w-80"
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          <div className="grid grid-cols-3 gap-4 h-64">
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
              {days.map(day => (
                <div
                  key={day}
                  onClick={(e) => updateDate('day', day, e)}
                  className={`p-2 text-center rounded hover:bg-blue-50 cursor-pointer transition-colors
                    ${selectedDate.getDate() === day ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
              {months.map((month, index) => (
                <div
                  key={month}
                  onClick={(e) => updateDate('month', month, e)}
                  className={`p-2 text-center rounded hover:bg-blue-50 cursor-pointer transition-colors
                    ${selectedDate.getMonth() === index ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                >
                  {month}
                </div>
              ))}
            </div>
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
              {years.map(year => (
                <div
                  key={year}
                  onClick={(e) => updateDate('year', year, e)}
                  className={`p-2 text-center rounded hover:bg-blue-50 cursor-pointer transition-colors
                    ${selectedDate.getFullYear() === year ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
                >
                  {year}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-2 border-t text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                setShowPicker(false);
              }}
              className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StudentAttendanceView = () => {
  const { data: attendance } = useSelector(state => state.attendance);
  const overallAttendance = attendance.reduce((acc, curr) => ({
    attended: acc.attended + curr.attendedClasses,
    total: acc.total + curr.totalClasses
  }), { attended: 0, total: 0 });

  const overallPercentage = Math.round(
    (overallAttendance.attended / overallAttendance.total) * 100 || 0
  );

  return (
    <div className="space-y-3 md:space-y-4 p-3 md:p-4">
      <h2 className="text-lg md:text-xl font-bold text-blue-900">My Attendance</h2>
      <div className="bg-white rounded-lg shadow-md border border-blue-100 overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-1.5 md:p-2 text-left text-xs md:text-sm">Subject</th>
              <th className="p-1.5 md:p-2 text-center text-xs md:text-sm">Attended</th>
              <th className="p-1.5 md:p-2 text-center text-xs md:text-sm">Total</th>
              <th className="p-1.5 md:p-2 text-center text-xs md:text-sm">%</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((item) => (
              <tr key={item._id} className="border-b border-blue-100 hover:bg-blue-50">
                <td className="p-1.5 md:p-2 text-xs md:text-sm truncate max-w-[120px]">{item.subject?.name}</td>
                <td className="p-1.5 md:p-2 text-center text-xs md:text-sm">{item.attendedClasses}</td>
                <td className="p-1.5 md:p-2 text-center text-xs md:text-sm">{item.totalClasses}</td>
                <td className="p-1.5 md:p-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.percentage >= 75 ? 'bg-green-100 text-green-800' :
                    item.percentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                    {item.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <h3 className="text-sm md:text-base font-semibold text-blue-800">Overall</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            overallPercentage >= 75 ? 'bg-green-100 text-green-800' :
            overallPercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'}`}>
            {overallPercentage}%
          </span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                overallPercentage >= 75 ? 'bg-green-600' :
                overallPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-600'}`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <p className="text-xs text-blue-600 mt-1">
            {overallAttendance.attended} / {overallAttendance.total} classes
          </p>
        </div>
      </div>
    </div>
  );
};


const AttendanceTab = ({ role }) => {
  const { classroomId } = useParams();
  const classId = classroomId;
  const dispatch = useDispatch();
  const { 
    data: allAttendance, 
    students: classStudents,
    subjects: classSubjects,
    loading,
    error 
  } = useSelector(state => state.attendance);
  
  const [viewMode, setViewMode] = useState('list');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState('');
  const [tempRecords, setTempRecords] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { if (classId) dispatch(fetchAttendance(classId)); }, [classId, dispatch]);

  useEffect(() => {
    if (classSubjects?.length > 0 && !selectedSubject) setSelectedSubject(classSubjects[0]._id);
  }, [classSubjects]);

  const CustomSubjectDropdown = () => (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg max-h-[80vh] flex flex-col">
        <div className="p-3 border-b flex justify-between items-center">
          <h3 className="font-medium">Select Subject</h3>
          <button onClick={() => setShowSubjectDropdown(false)} className="text-blue-500 text-sm">
            Done
          </button>
        </div>
        <div className="overflow-y-auto">
          {classSubjects?.map(subject => (
            <button
              key={subject._id}
              onClick={() => { setSelectedSubject(subject._id); setShowSubjectDropdown(false); }}
              className={`w-full text-left p-3 text-sm ${
                selectedSubject === subject._id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const initNewAttendance = () => {
    const initialRecords = Object.fromEntries(classStudents?.map(student => [student._id, true]) || []);
    setTempRecords(initialRecords);
    setAttendanceDate(new Date().toISOString().split('T')[0]);
  };

  const handleToggle = (studentId) => {
    setTempRecords(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const attendanceData = {
      subjectId: selectedSubject,
      date: attendanceDate,
      records: Object.entries(tempRecords).map(([studentId, present]) => ({ studentId, present }))
    };
    if (viewMode === 'add') await dispatch(addAttendance({ classId, attendanceData }));
    else await dispatch(editAttendance({ classId, attendanceId: selectedRecord._id, attendanceData }));
    setViewMode('list');
  };

  const handleDelete = async () => {
    await dispatch(deleteAttendanceRecord({ classId, subjectId: selectedSubject, attendanceId: selectedRecord._id }));
    setShowDeleteConfirm(false);
  };

  const filteredStudents = classStudents?.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role === 'student') return <StudentAttendanceView />;

  const attendanceList = allAttendance.filter(record => record.subject?._id === selectedSubject);

  return (
    <div className="p-2 md:p-4 max-w-4xl mx-auto">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { display: none !important; }
        input[type="date"]::-webkit-inner-spin-button { display: none; }
      `}</style>

      {isMobile && viewMode !== 'list' && (
        <div className="flex items-center mb-4">
          <button onClick={() => setViewMode('list')} className="mr-2 p-2 text-gray-600">
            <FaChevronLeft />
          </button>
          <h2 className="text-lg font-bold">
            {viewMode === 'add' ? 'Add Attendance' : 'Edit Attendance'}
          </h2>
        </div>
      )}

      {(!isMobile || viewMode === 'list') && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {isMobile ? 'Attendance' : 'Attendance Management'}
            {selectedSubject && ` - ${classSubjects.find(s => s._id === selectedSubject)?.name}`}
          </h2>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <button
                onClick={() => setShowSubjectDropdown(true)}
                className="w-full px-3 py-2 border rounded-lg bg-white text-sm text-left flex justify-between items-center"
                disabled={viewMode !== 'list' || loading}
              >
                <span className="truncate">
                  {classSubjects.find(s => s._id === selectedSubject)?.name || 'Select Subject'}
                </span>
                <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showSubjectDropdown && <CustomSubjectDropdown />}
            </div>
            {viewMode === 'list' && (
              <button
                onClick={() => { initNewAttendance(); setViewMode('add'); }}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-1 text-sm md:text-base whitespace-nowrap"
                disabled={loading || !selectedSubject}
              >
                <FaPlus size={14} /> {!isMobile && 'Add'}
              </button>
            )}
          </div>
        </div>
      )}

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      {loading && (
        <div className="text-center p-4">
          <FaSpinner className="animate-spin text-2xl text-blue-500" />
        </div>
      )}

      {selectedSubject ? (
        <>
          {viewMode === 'list' && (
            <div className="bg-white rounded-lg shadow">
              {!isMobile && (
                <div className="p-3 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaList className="text-blue-500" />
                    Attendance Records
                  </h3>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left text-sm">Date</th>
                      <th className="p-2 text-center text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceList?.map(record => (
                      <tr key={record._id} className="border-t hover:bg-gray-50">
                        <td className="p-2">
                          <div className="flex items-center">
                            <FaCalendarAlt className="inline mr-2 text-gray-500 text-sm" />
                            <span className="text-sm">
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => setViewingRecord(record)}
                              className="text-green-500 hover:text-green-700 p-1"
                              title="View"
                            >
                              <FaEye size={14} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setViewMode('edit');
                                setTempRecords(Object.fromEntries(record.records.map(r => [r.studentId, r.present])));
                                setAttendanceDate(record.date.split('T')[0]);
                              }}
                              className="text-blue-500 hover:text-blue-700 p-1"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => { setSelectedRecord(record); setShowDeleteConfirm(true); }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {attendanceList?.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No attendance records found for this subject
                </div>
              )}
            </div>
          )}

          {(viewMode === 'add' || viewMode === 'edit') && (
            <div className="bg-white rounded-lg shadow p-3 md:p-4 mt-2 w-full max-w-full">
              {!isMobile && (
                <h3 className="text-lg md:text-xl font-semibold mb-3 flex items-center gap-2">
                  {viewMode === 'add' ? <FaPlus /> : <FaEdit />}
                  {viewMode === 'add' ? 'New Attendance for ' : 'Edit Attendance for '}
                  {classSubjects.find(s => s._id === selectedSubject)?.name}
                </h3>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <DateInputField value={attendanceDate} onChange={setAttendanceDate} />
                </div>
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Students</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-2 py-1 border rounded-lg text-sm w-32 md:w-40"
                      />
                      <FaSearch className="absolute left-2 top-2 text-gray-400 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {filteredStudents?.map(student => (
                      <div key={student._id} className="flex items-center p-2 bg-gray-50 rounded text-sm">
                        <input
                          type="checkbox"
                          checked={!!tempRecords[student._id]}
                          onChange={() => handleToggle(student._id)}
                          className="h-4 w-4 text-blue-500 rounded border-gray-300"
                        />
                        <span className="ml-2 truncate">{student.name}</span>
                        <span className="ml-auto">
                          {tempRecords[student._id] ? (
                            <span className="text-green-600 flex items-center text-xs">
                              {!isMobile && <FaCheck className="mr-1" />} Present
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center text-xs">
                              {!isMobile && <FaTimes className="mr-1" />} Absent
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!attendanceDate}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      attendanceDate ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {viewMode === 'add' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {viewingRecord && (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaEye className="text-blue-500" />
                    Attendance Details
                  </h3>
                  <button onClick={() => setViewingRecord(null)} className="text-gray-500 hover:text-gray-700">
                    <FaTimes />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    {classSubjects.find(s => s._id === viewingRecord.subject)?.name} • 
                    {new Date(viewingRecord.date).toLocaleDateString()}
                  </p>
                  <div className="mb-4">
                    <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1 text-sm">
                      <FaCheck /> Present ({viewingRecord.records.filter(r => r.present).length})
                    </h4>
                    <ul className="space-y-1">
                      {classStudents
                        ?.filter(student => viewingRecord.records.some(r => r.studentId === student._id && r.present))
                        .map(student => (
                          <li key={student._id} className="bg-green-50 p-2 rounded text-sm">
                            {student.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium text-red-600 mb-2 flex items-center gap-1 text-sm">
                      <FaTimes /> Absent ({viewingRecord.records.filter(r => !r.present).length})
                    </h4>
                    <ul className="space-y-1">
                      {classStudents
                        ?.filter(student => viewingRecord.records.some(r => r.studentId === student._id && !r.present))
                        .map(student => (
                          <li key={student._id} className="bg-red-50 p-2 rounded text-sm">
                            {student.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className="p-4 border-t">
                  <button
                    onClick={() => setViewingRecord(null)}
                    className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white p-4 rounded-lg w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-3">Confirm Delete</h3>
                <p className="mb-4 text-sm">Are you sure you want to delete this attendance record?</p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 py-8 text-sm">
          Please select a subject to view attendance records
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;