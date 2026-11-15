import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassMember, requireClassTeacherOrAdmin } from '../middleware/rbac.js';
import { addAnnouncement, editAnnouncement, deleteAnnouncement, getAnnouncements } from '../controllers/announcementController.js';

const announcementRouter = express.Router();

announcementRouter.post('/', isLoggedIn, requireClassTeacherOrAdmin, addAnnouncement);
announcementRouter.put('/', isLoggedIn, editAnnouncement);
announcementRouter.delete('/', isLoggedIn, deleteAnnouncement);
announcementRouter.get('/:classroomId', isLoggedIn, requireClassMember, getAnnouncements);

export default announcementRouter;
