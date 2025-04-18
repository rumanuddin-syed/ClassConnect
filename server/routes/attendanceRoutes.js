import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { getAttendanceData,addAttendance,editAttendance,deleteAttendance  } from '../controllers/attendanceController.js';

const attendanceRouter = express.Router();

attendanceRouter.post('/', isLoggedIn, addAttendance);

attendanceRouter.put('/', isLoggedIn, editAttendance);

attendanceRouter.delete('/', isLoggedIn, deleteAttendance);

attendanceRouter.get('/',isLoggedIn,getAttendanceData);

export default attendanceRouter;