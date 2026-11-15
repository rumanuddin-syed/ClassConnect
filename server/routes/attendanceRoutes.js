import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassTeacherOrAdmin, requireClassMember } from '../middleware/rbac.js';
import { getAttendanceData, addAttendance, editAttendance, deleteAttendance } from '../controllers/attendanceController.js';

const attendanceRouter = express.Router();

attendanceRouter.post('/', isLoggedIn, requireClassTeacherOrAdmin, addAttendance);
attendanceRouter.put('/', isLoggedIn, requireClassTeacherOrAdmin, editAttendance);
attendanceRouter.delete('/', isLoggedIn, requireClassTeacherOrAdmin, deleteAttendance);
attendanceRouter.get('/', isLoggedIn, requireClassMember, getAttendanceData);

export default attendanceRouter;
