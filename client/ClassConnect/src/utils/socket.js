import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  if (!token) {
    throw new Error('Cannot connect socket: No token provided');
  }
  const rawToken = token.replace(/^Bearer\s+/i, '').trim();
  socket = io("https://classconnect-gsov.onrender.com/", {
    auth: { 
      token:rawToken,
    },
    withCredentials: true,
    transports: ['websocket'],
    reconnection: false // Disable during debugging
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection failed:', {
      message: err.message,
      description: err.description,
      context: err.context
    });
  });


  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

