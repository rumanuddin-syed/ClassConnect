import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassMember } from '../middleware/rbac.js';
import { getClassroomDetails } from '../controllers/classController.js';

const classRouter = express.Router();

classRouter.get("/:classroomId", isLoggedIn, requireClassMember, getClassroomDetails);

export default classRouter;