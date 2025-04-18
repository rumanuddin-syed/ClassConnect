import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { getClassroomDetails } from '../controllers/classController.js';

const classRouter = express.Router();

classRouter.get("/:classroomId",isLoggedIn,getClassroomDetails);

export default classRouter;