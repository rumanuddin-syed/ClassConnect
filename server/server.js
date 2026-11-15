import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userClassRouter from "./routes/userClassRoutes.js";
import userDetailsRouter from "./routes/userRoutes.js";
import classRouter from "./routes/classRoutes.js";
import announcementRouter from "./routes/announcementRoutes.js";
import subjectRouter from "./routes/subjectRoutes.js";
import invitationRouter from "./routes/invitationRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import memoryRouter from "./routes/memoryRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import attendanceRouter from "./routes/attendanceRoutes.js";

import { createServer } from "http";
import { initializeSocket, getIO } from "./socketInstance.js";
import jwt from "jsonwebtoken";
import Classroom from "./models/classroomModel.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 4000;
connectDB();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()) 
  : ["http://localhost:5173"];

// CSRF Defense: Origin/Referer verification & Custom Header check for state-changing requests
app.use((req, res, next) => {
  const isStateChanging = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
  
  if (isStateChanging && req.path.startsWith("/api")) {
    const origin = req.headers["origin"];
    const referer = req.headers["referer"];

    // Validate Origin or Referer against allowed origins when present
    if (origin) {
      if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ success: false, message: "CSRF verification failed: Origin not allowed" });
      }
    } else if (referer) {
      const refererOrigin = new URL(referer).origin;
      if (!allowedOrigins.includes(refererOrigin)) {
        return res.status(403).json({ success: false, message: "CSRF verification failed: Referer origin not allowed" });
      }
    }

    const customHeader = req.headers["x-requested-with"] || req.headers["x-csrf-token"];
    if (!customHeader) {
      return res.status(403).json({ success: false, message: "CSRF verification failed: Missing required request header (X-Requested-With)" });
    }
  }
  next();
});

app.use(cors({ 
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true 
}));

const httpServer = createServer(app);
const io = initializeSocket(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "client", "ClassConnect", "dist");

// Socket.IO authentication middleware: verifies credentials strictly via HttpOnly cookie
io.use((socket, next) => {
  try {
    let token = null;
    
    if (socket.handshake.headers?.cookie) {
      const cookieHeader = socket.handshake.headers.cookie;
      const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.id || decoded.userId;
    socket.userName = decoded.name;
    socket.userEmail = decoded.email;

    next();
  } catch (err) {
    next(new Error(`Authentication error: ${err.message}`));
  }
});

io.on("connection", (socket) => {
  // Join classroom room only if authorized
  socket.on("join-classroom", async (classId) => {
    try {
      if (!classId) return;
      const classroom = await Classroom.findById(classId);
      if (!classroom) return;

      const userId = socket.userId?.toString();
      const isAdmin = classroom.admin?.toString() === userId;
      const isMember = classroom.members?.some(
        (m) => (m.user?._id || m.user).toString() === userId
      );

      if (isAdmin || isMember) {
        socket.join(classId);
      } else {
        socket.emit("error", { message: "Unauthorized to join this classroom room" });
      }
    } catch (err) {
      console.error("Socket join error:", err);
    }
  });

  socket.on("disconnect", () => {});
});

app.get("/", (req, res) => res.send("API working fine"));
app.use("/api/auth", authRouter);
app.use("/api/user-class", userClassRouter);
app.use("/api/get-user", userDetailsRouter);
app.use("/api/class", classRouter);
app.use("/api/announcement", announcementRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/invitation", invitationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/memory", memoryRouter);
app.use("/api/event", eventRouter);
app.use("/api/attendance", attendanceRouter);
app.use(express.static(clientBuildPath));

// Handle frontend routes
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  }
});

// Catch unmatched API routes
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

httpServer.listen(port, () => console.log(`Server started on PORT:${port}`));
