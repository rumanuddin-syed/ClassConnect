import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { addSubject,editSubject,deleteSubject } from '../controllers/subjectsController.js';

const subjectRouter = express.Router();

subjectRouter.post('/', isLoggedIn, addSubject);

subjectRouter.put('/', isLoggedIn, editSubject);

subjectRouter.delete('/', isLoggedIn, deleteSubject);


export default subjectRouter;