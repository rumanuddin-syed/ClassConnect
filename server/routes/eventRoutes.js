import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { addEvent,editEvent,deleteEvent,getEvents } from '../controllers/eventController.js';

const eventRouter = express.Router();

eventRouter.post('/', isLoggedIn, addEvent);

eventRouter.put('/', isLoggedIn, editEvent);

eventRouter.delete('/', isLoggedIn, deleteEvent);

eventRouter.get('/',isLoggedIn,getEvents);

export default eventRouter;