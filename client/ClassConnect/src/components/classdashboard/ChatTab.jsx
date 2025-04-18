import { useEffect, useState, useRef, useCallback } from 'react';
import { FaTrash, FaEdit, FaCheck, FaTimes, FaPaperPlane, FaUser } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchChats, 
  sendMessage, 
  editMessage, 
  deleteMessage,
  addLocalMessage
} from '../../redux/slices/chatSlice';
import { useParams } from "react-router-dom";
import { connectSocket } from '../../utils/socket';

const ChatTab = ({ role }) => {
  const { classroomId } = useParams();
  const classId = classroomId;
  const dispatch = useDispatch();
  
  const { messages, status, error } = useSelector((state) => state.chat);
  const currUser = useSelector((state) => state.user);
  
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const currentUser = { 
    id: currUser.userId, 
    name: currUser.name, 
    role: role 
  };

  // Memoized scroll function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load chats when component mounts or classId changes
  useEffect(() => {
    if (classId) {
      dispatch(fetchChats(classId));
    }
  }, [classId, dispatch]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) {
      console.error('No token available for socket connection');
      return;
    }
  
    let socket;
    let isMounted = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
  
    const setupSocket = () => {
      socket = connectSocket(token);
  
      socket.on('connect', () => {
        socket.emit('join-classroom', classroomId);
        reconnectAttempts = 0;
      });
  
      socket.on('new-message', (message) => {
        if (isMounted && message.senderId !== currentUser.id) {
          dispatch(addLocalMessage(message));
        }
      });
  
      socket.on('message-edited', (message) => {
        if (isMounted && message.senderId !== currentUser.id) {
          dispatch(editMessage.fulfilled(message));
        }
      });
  
      socket.on('message-deleted', (message) => {
        if (isMounted && message.senderId !== currentUser.id) {
          dispatch(deleteMessage.fulfilled({ res: message, hardDelete: false }));
        }
      });
  
      socket.on('message-removed', (chatId) => {
        if (isMounted) {
          dispatch(deleteMessage.fulfilled({ res: chatId, hardDelete: true }));
        }
      });
  
      socket.on('disconnect', (reason) => {
        if (isMounted && reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++;
            setupSocket();
          }, 1000 * reconnectAttempts);
        }
      });
  
      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        if (isMounted && socket.active) {
          socket.connect();
        }
      });
    };
  
    setupSocket();
  
    return () => {
      isMounted = false;
      if (socket) {
        socket.off('connect');
        socket.off('new-message');
        socket.off('message-edited');
        socket.off('message-deleted');
        socket.off('message-removed');
        socket.off('disconnect');
        socket.off('connect_error');
        
        if (socket.connected) {
          socket.disconnect();
        }
      }
    };
  }, [token, classroomId, dispatch, currentUser.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setNewMessage('');
    
    try {
      await dispatch(sendMessage({ 
        classId, 
        message: newMessage,
      })).unwrap();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleEditMessage = (chatId, messageText) => {
    setEditingId(chatId);
    setEditText(messageText);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    
    try {
      await dispatch(editMessage({ 
        classId, 
        chatSchemaId: editingId, 
        editedMessage: editText 
      })).unwrap();
      setEditingId(null);
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (chatId, hardDelete = false) => {
    try {
      await dispatch(deleteMessage({ 
        classId, 
        chatSchemaId: chatId,
        hardDelete
      })).unwrap();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const canEditMessage = (message) => {
    return !message.isDeleted && 
           (currentUser.role === 'admin' || message.senderId === currentUser.id);
  };

  const canDeleteMessage = (message) => {
    return currentUser.role === 'admin' || message.senderId === currentUser.id;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'loading' && messages.length === 0) {
    return <div className="flex justify-center p-4">Loading messages...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-[100svh] md:h-[90vh] overflow-hidden fixed inset-0 md:relative md:inset-auto"
    >
      {/* Fixed Header */}
      <div className="bg-blue-600 rounded-t-2xl text-white p-4 flex-shrink-0 justify-center">
        <h2 className="text-xl font-bold text-center">Class Chat</h2>
      </div>

      {/* Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto touch-pan-y p-4 bg-blue-50 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.chatId} 
              className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs md:max-w-md rounded-2xl p-3 ${
                  message.senderId === currentUser.id
                    ? message.isDeleted
                      ? 'bg-gray-200 text-gray-500 italic rounded-br-none'
                      : 'bg-blue-500 text-white rounded-br-none'
                    : message.isDeleted
                      ? 'bg-gray-100 text-gray-400 italic rounded-bl-none'
                      : 'bg-white text-blue-900 shadow rounded-bl-none'
                }`}
              >
                {editingId === message.chatId ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="p-2 rounded-lg text-blue-900"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                    <div className="flex space-x-2 justify-end">
                      <button 
                        onClick={handleSaveEdit}
                        className="p-1 bg-green-500 text-white rounded-full"
                      >
                        <FaCheck />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-1 bg-red-500 text-white rounded-full"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.senderId !== currentUser.id && (
                        <div className="bg-blue-100 p-1 rounded-full">
                          <FaUser className="text-blue-600" />
                        </div>
                      )}
                      <span className={`text-xs font-semibold ${message.senderId === currentUser.id ? 'text-blue-100' : 'text-blue-600'}`}>
                        {message.senderName || 'Unknown'}
                      </span>
                    </div>
                    <p className={`break-words ${message.isDeleted ? 'italic' : ''}`}>
                      {message.message}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`text-xs ${message.senderId === currentUser.id ? 'text-blue-200' : 'text-blue-500'}`}>
                        {formatTimestamp(message.timestamp)}
                        {message.isEdited && !message.isDeleted && ' • Edited'}
                      </span>
                      {(canEditMessage(message) || canDeleteMessage(message)) && (
                        <div className="flex space-x-1">
                          {canEditMessage(message) && (
                            <button 
                              onClick={() => handleEditMessage(message.chatId, message.message)}
                              className="text-xs p-1 hover:bg-white/20 rounded-full"
                              aria-label="Edit message"
                            >
                              <FaEdit size={12} />
                            </button>
                          )}
                          {canDeleteMessage(message) && (
                            <button 
                              onClick={() => handleDeleteMessage(
                                message.chatId, 
                                message.isDeleted
                              )}
                              className={`text-xs p-1 rounded-full ${
                                message.isDeleted 
                                  ? 'hover:bg-red-500/20 text-red-500' 
                                  : 'hover:bg-white/20'
                              }`}
                              aria-label={message.isDeleted ? "Permanently delete" : "Delete message"}
                            >
                              <FaTrash size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-blue-200 p-4 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl flex items-center justify-center disabled:opacity-50"
            aria-label="Send message"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTab;