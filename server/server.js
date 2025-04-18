import express from "express";
import cors from "cors";
import 'dotenv/config' ;
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js"
import authRouter from "./routes/authRoutes.js"
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

import { createServer } from 'http';
import { initializeSocket ,getIO} from './socketInstance.js';
import jwt from "jsonwebtoken"
const app = express();
const port = process.env.PORT || 4000;


connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: "http://localhost:5173",credentials:true}))

const httpServer = createServer(app);
const io = initializeSocket(httpServer); // Get the io instance

io.use((socket, next) => {
      try {
          const token = socket.handshake.auth.token;

          if (!token) {
            console.error('No token provided');
            return next(new Error('Authentication error: No token provided'));
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          socket.userId = decoded.userId;
          socket.userName = decoded.name;

          next();
          } catch (err) {
          console.error('Socket auth error:', {
            name: err.name,
            message: err.message,
            expiredAt: err.expiredAt,
            stack: err.stack
          });
          next(new Error(`Authentication error: ${err.message}`));
          }
});
  

  io.on('connection', (socket) => {
  
    // Join classroom room
    socket.on('join-classroom', (classId) => {
      socket.join(classId);
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
    });
  });

app.get('/',(req,res)=>res.send("API working fine"));
app.use('/api/auth',authRouter);
app.use('/api/user-class',userClassRouter);
app.use('/api/get-user',userDetailsRouter);
app.use('/api/class',classRouter);
app.use('/api/announcement',announcementRouter);
app.use('/api/subject',subjectRouter);
app.use('/api/invitation',invitationRouter);
app.use('/api/chat',chatRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/event',eventRouter);
app.use('/api/attendance',attendanceRouter);
app.use((req,res)=>{
    res.status(404).send("No page found");
})

httpServer.listen(port, () => console.log(`Server started on PORT:${port}`));
