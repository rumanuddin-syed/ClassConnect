import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassAdmin } from '../middleware/rbac.js';
import { getInvitations, acceptInvitation, rejectInvitation } from '../controllers/invitationController.js';

const invitationRouter = express.Router();

invitationRouter.get('/', isLoggedIn, requireClassAdmin, getInvitations);
invitationRouter.post('/accept', isLoggedIn, requireClassAdmin, acceptInvitation);
invitationRouter.post('/reject', isLoggedIn, requireClassAdmin, rejectInvitation);

export default invitationRouter;
