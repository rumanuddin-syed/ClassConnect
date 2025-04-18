import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { getInvitations,acceptInvitation,rejectInvitation } from '../controllers/invitationController.js';


const invitationRouter = express.Router();

invitationRouter.get('/', isLoggedIn, getInvitations);

invitationRouter.post('/accept', isLoggedIn, acceptInvitation);

invitationRouter.post('/reject', isLoggedIn, rejectInvitation);


export default invitationRouter;
