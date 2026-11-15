import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassMember } from '../middleware/rbac.js';
import { 
  createMemory,
  editMemory,
  deleteMemory,
  getMemories
} from '../controllers/memoryController.js';
import { upload } from '../config/cloudinaryConfig.js';

const memoryRouter = express.Router();

memoryRouter.post('/', isLoggedIn, upload.single('image'), requireClassMember, createMemory);
memoryRouter.put('/', isLoggedIn, upload.single('image'), editMemory);
memoryRouter.delete('/', isLoggedIn, deleteMemory);
memoryRouter.get('/', isLoggedIn, requireClassMember, getMemories);

export default memoryRouter;
