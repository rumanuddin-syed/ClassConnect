import express from 'express';
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { 
  createMemory,
  editMemory,
  deleteMemory,
  getMemories
} from '../controllers/memoryController.js';
import {upload} from '../config/cloudinaryConfig.js';

const memoryRouter = express.Router();

memoryRouter.post('/', isLoggedIn, upload.single('image'), createMemory);
memoryRouter.put('/', isLoggedIn, upload.single('image'), editMemory);
memoryRouter.delete('/', isLoggedIn, deleteMemory);
memoryRouter.get('/', isLoggedIn, getMemories);

export default memoryRouter;