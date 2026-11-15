import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassAdmin } from '../middleware/rbac.js';
import { addSubject, editSubject, deleteSubject } from '../controllers/subjectsController.js';

const subjectRouter = express.Router();

subjectRouter.post('/', isLoggedIn, requireClassAdmin, addSubject);
subjectRouter.put('/', isLoggedIn, editSubject);
subjectRouter.delete('/', isLoggedIn, deleteSubject);

export default subjectRouter;