import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { addChat,editChat,deleteChat,getChats } from '../controllers/chatController.js';
import { getIO } from '../socketInstance.js';

const chatRouter = express.Router();

chatRouter.post('/', isLoggedIn, (req, res) => {
    req.io = getIO(); // Pass socket.io instance
    addChat(req, res);
  });
  

chatRouter.put('/', isLoggedIn, (req, res) => {
    req.io =  getIO(); // Pass socket.io instance
    editChat(req, res);
  });

chatRouter.delete('/', isLoggedIn, (req, res) => {
    req.io =  getIO(); // Pass socket.io instance
    deleteChat(req, res);
  });

chatRouter.get('/', isLoggedIn,getChats )

export default chatRouter;
