import { io } from "socket.io-client";

let socket;

/**
 * Socket.IO client using standard credentials/cookie transport.
 */
export const connectSocket = () => {
  const options = {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
  };

  socket = io("http://localhost:4000", options);

  socket.on("connect_error", (err) => {
    console.error("Socket connection failed:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

export default connectSocket;
