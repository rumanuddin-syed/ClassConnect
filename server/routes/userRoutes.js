import express from 'express'
import {isLoggedIn} from '../middleware/isLoggedIn.js';
import { getUserDetails } from '../controllers/userDetailsController.js';

const userDetailsRouter = express.Router();

userDetailsRouter.get("/",isLoggedIn,getUserDetails);

export default userDetailsRouter;