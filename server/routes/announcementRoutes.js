import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import  {addAnnouncement,editAnnouncement,deleteAnnouncement,getAnnouncements}   from '../controllers/announcementController.js';

const announcementRouter = express.Router();

announcementRouter.post('/', isLoggedIn, addAnnouncement);

announcementRouter.put('/', isLoggedIn, editAnnouncement);

announcementRouter.delete('/', isLoggedIn, deleteAnnouncement);

announcementRouter.get('/:classroomId', isLoggedIn, getAnnouncements);

export default announcementRouter;
