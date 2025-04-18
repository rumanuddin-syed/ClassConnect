// server/socketInstance.js
import { Server } from 'socket.io';

let io = null;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:[ "https://classconnectproject.onrender.com"],
      credentials: true
    }
  });
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};