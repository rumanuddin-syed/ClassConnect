import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassMember } from '../middleware/rbac.js';
import { addChat, editChat, deleteChat, getChats } from '../controllers/chatController.js';
import { getIO } from '../socketInstance.js';

const chatRouter = express.Router();

chatRouter.post('/', isLoggedIn, requireClassMember, (req, res) => {
  req.io = getIO();
  addChat(req, res);
});

chatRouter.put('/', isLoggedIn, (req, res) => {
  req.io = getIO();
  editChat(req, res);
});

chatRouter.delete('/', isLoggedIn, (req, res) => {
  req.io = getIO();
  deleteChat(req, res);
});

chatRouter.get('/', isLoggedIn, requireClassMember, getChats);

export default chatRouter;
