import { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek, 
  addDays, 
  isSameDay, 
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  eachDayOfInterval,
} from 'date-fns';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setCurrentEvent,
  clearCurrentEvent
} from '../../redux/slices/eventSlice';

const ScrollableCalendar = ({ selectedDate, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));
  const isMobile = window.innerWidth < 768;

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2 mb-2">
        <button 
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
        >
          <FaChevronLeft size={14} />
        </button>
        <span className="font-medium text-sm">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button 
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded-full"
        >
          <FaChevronRight size={14} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => (
          <button
            key={day}
            onClick={() => onDateClick(day)}
            className={`text-xs p-1 rounded aspect-square ${
              isSameDay(day, selectedDate) ? 'bg-blue-600 text-white' :
              isSameMonth(day, currentMonth) ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-100'
            }`}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
};

const CalendarTab = ({ role }) => {
  const { classroomId } = useParams();
  const dispatch = useDispatch();
  const { events, status, error, currentEvent: selectedEvent } = useSelector(state => state.events);
  const currUser = useSelector((state) => state.user);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    description: '',
    classId: classroomId
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (classroomId) dispatch(fetchEvents(classroomId));
  }, [classroomId, dispatch]);

  const canEditEvent = (event) => role === 'admin' || event.creatorId === currUser.userId;
  const canDeleteEvent = (event) => role === 'admin' || event.creatorId === currUser.userId;

  const navigateMonth = (direction) => {
    setSelectedDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    setNewEvent(prev => ({ ...prev, date: format(day, 'yyyy-MM-dd') }));
  };

  const handleAddEvent = async () => {
    try {
      await dispatch(addEvent(newEvent));
      setShowEventModal(false);
      setNewEvent({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '12:00',
        description: '',
        classId: classroomId
      });
    } catch (error) {
      console.error('Failed to add event:', error);
    }
  };

  const handleEditEvent = async () => {
    try {
      await dispatch(updateEvent({
        eventId: selectedEvent.id,
        eventData: { ...selectedEvent, classId: classroomId }
      }));
      setShowEditModal(false);
      dispatch(clearCurrentEvent());
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await dispatch(deleteEvent({ eventId: id, classId: classroomId }));
      dispatch(clearCurrentEvent());
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
      <div className="flex items-center space-x-2 md:space-x-4">
        <button 
          onClick={() => navigateMonth('prev')}
          className="p-1 md:p-2 text-blue-600 hover:bg-blue-100 rounded-full"
        >
          <FaChevronLeft size={isMobile ? 14 : 16} />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-blue-900">
          {format(selectedDate, isMobile ? "MMM yyyy" : "MMMM yyyy")}
        </h2>
        <button 
          onClick={() => navigateMonth('next')}
          className="p-1 md:p-2 text-blue-600 hover:bg-blue-100 rounded-full"
        >
          <FaChevronRight size={isMobile ? 14 : 16} />
        </button>
      </div>
      {(role === 'admin' || role === 'teacher') && (
        <button 
          onClick={() => setShowEventModal(true)}
          className="flex items-center space-x-1 md:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 md:px-3 md:py-2 rounded-lg text-sm md:text-base"
        >
          <FaPlus size={isMobile ? 12 : 14} />
          <span>Add Event</span>
        </button>
      )}
    </div>
  );

  const renderDays = () => {
    const startDate = startOfWeek(selectedDate);
    return (
      <div className="grid grid-cols-7">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="text-center font-medium text-blue-600 py-1 md:py-2 text-xs md:text-sm">
            {format(addDays(startDate, i), isMobile ? "EEEEE" : "EEE")}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart);
    const endDate = startOfWeek(endOfMonth(monthStart));

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayEvents = events.filter(e => isSameDay(parseISO(e.date), cloneDay));
        
        days.push(
          <div
            key={day}
            className={`min-h-16 md:min-h-24 p-1 md:p-2 border border-blue-100 text-xs md:text-sm ${
              !isSameMonth(day, monthStart) ? "bg-gray-50 text-gray-400" :
              isSameDay(day, selectedDate) ? "bg-blue-200" : "bg-blue-50 hover:bg-blue-100"
            }`}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className="flex justify-between">
              <span className={`${
                isSameDay(day, new Date()) ? 
                "bg-blue-600 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center" : ""
              }`}>
                {format(day, "d")}
              </span>
              {isSameDay(day, selectedDate) && (role === 'admin' || role === 'teacher') && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEventModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <FaPlus size={isMobile ? 10 : 12} />
                </button>
              )}
            </div>
            <div className="mt-1 space-y-0.5 overflow-y-auto max-h-12 md:max-h-20">
              {dayEvents.map(event => (
                <div 
                  key={event.id}
                  className="text-xxs md:text-xs p-0.5 md:p-1 bg-blue-200 rounded truncate cursor-pointer hover:bg-blue-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setCurrentEvent(event));
                  }}
                >
                  {isMobile ? `${event.time.slice(0,5)} - ${event.title.slice(0,5)}...` 
                    : `${event.time} - ${event.title.slice(0,15)}${event.title.length > 15 ? '...' : ''}`}
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day}>{days}</div>);
      days = [];
    }
    return <div className="mb-4">{rows}</div>;
  };

  if (status === 'loading' && !events.length) return <div className="flex justify-center py-8">Loading events...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {selectedEvent && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => dispatch(clearCurrentEvent())}
              className="absolute top-2 md:top-4 right-2 md:right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={isMobile ? 16 : 20} />
            </button>
            <h3 className="text-lg md:text-xl font-bold mb-2">{selectedEvent.title}</h3>
            <p className="text-blue-600 mb-1 text-sm md:text-base">
              {format(parseISO(selectedEvent.date), 'PPP')} at {selectedEvent.time}
            </p>
            <p className="text-blue-800 mb-4 text-sm md:text-base">{selectedEvent.description}</p>
            {(canEditEvent(selectedEvent) || canDeleteEvent(selectedEvent)) && (
              <div className="flex justify-end space-x-2">
                {canEditEvent(selectedEvent) && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-2 py-1 md:px-3 md:py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-xs md:text-sm"
                  >
                    <FaEdit className="mr-1" size={isMobile ? 12 : 14} /> Edit
                  </button>
                )}
                {canDeleteEvent(selectedEvent) && (
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-2 py-1 md:px-3 md:py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center text-xs md:text-sm"
                  >
                    <FaTrash className="mr-1" size={isMobile ? 12 : 14} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-2 md:top-4 right-2 md:right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={isMobile ? 16 : 20} />
            </button>
            <h3 className="text-lg md:text-xl font-bold mb-4">Add New Event</h3>
            <div className="space-y-3 md:space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-blue-200 rounded-lg text-sm md:text-base"
                required
              />
              <ScrollableCalendar
                selectedDate={parseISO(newEvent.date)}
                onDateClick={(date) => setNewEvent(prev => ({
                  ...prev,
                  date: format(date, 'yyyy-MM-dd')
                }))}
              />
              <input
                type="time"
                value={newEvent.time}
                onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                className="w-full p-2 border border-blue-200 rounded-lg text-sm md:text-base"
                required
              />
              <textarea
                placeholder="Description"
                value={newEvent.description}
                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-blue-200 rounded-lg text-sm md:text-base"
                rows="3"
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowEventModal(false)}
                  className="px-3 py-1 md:px-4 md:py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm md:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEvent}
                  disabled={status === 'loading'}
                  className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm md:text-base"
                >
                  {status === 'loading' ? 'Adding...' : 'Add Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedEvent && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-navy-120 to-blue-100 bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-2 md:top-4 right-2 md:right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes size={isMobile ? 16 : 20} />
            </button>
            <h3 className="text-lg md:text-xl font-bold mb-4">Edit Event</h3>
            <div className="space-y-3 md:space-y-4">
              <input
                type="text"
                placeholder="Event Title"
                value={selectedEvent.title}
                onChange={(e) => dispatch(setCurrentEvent({ ...selectedEvent, title: e.target.value }))}
                className="w-full p-2 border border-blue-200 rounded-lg text-sm md:text-base"
                required
              />
              <ScrollableCalendar
                selectedDate={parseISO(selectedEvent.date)}
                onDateClick={(date) => dispatch(setCurrentEvent({
                  ...selectedEvent,
                  date: format(date, 'yyyy-MM-dd')
                }))}
              />
              <input
                type="time"
                value={selectedEvent.time}
                onChange={(e) => dispatch(setCurrentEvent({ ...selectedEvent, time: e.target.value }))}
                className="w-full p-2 border border-blue-200 rounded-lg text-sm md:text-base"
                required
              />
              <textarea
                placeholder="Description"
                value={selectedEvent.description}
                onChange={(e) => dispatch(setCurrentEvent({ ...selectedEvent, description: e.target.value }))}
                className="w-full p-2 border border-blue-200 rounded-lg text-sm md:text-base"
                rows="3"
              />
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-1 md:px-4 md:py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm md:text-base"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEditEvent}
                  disabled={status === 'loading'}
                  className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm md:text-base"
                >
                  {status === 'loading' ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;