import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassTeacherOrAdmin, requireClassMember } from '../middleware/rbac.js';
import { addEvent, editEvent, deleteEvent, getEvents } from '../controllers/eventController.js';

const eventRouter = express.Router();

eventRouter.post('/', isLoggedIn, requireClassTeacherOrAdmin, addEvent);
eventRouter.put('/', isLoggedIn, editEvent);
eventRouter.delete('/', isLoggedIn, deleteEvent);
eventRouter.get('/', isLoggedIn, requireClassMember, getEvents);

export default eventRouter;
