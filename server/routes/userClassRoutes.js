import express from 'express';
import { isLoggedIn } from '../middleware/isLoggedIn.js';
import { requireClassAdmin } from '../middleware/rbac.js';
import {
  getUserClasses,
  createUserClass,
  reqJoinClass,
  removeMember,
  editClassroom,
  deleteClassroom
} from "../controllers/userClassController.js";

const userClassRouter = express.Router();

userClassRouter.get("/", isLoggedIn, getUserClasses);
userClassRouter.post("/create-class", isLoggedIn, createUserClass);
userClassRouter.post("/req-join-class", isLoggedIn, reqJoinClass);
userClassRouter.post("/remove-member", isLoggedIn, requireClassAdmin, removeMember);
userClassRouter.put("/", isLoggedIn, requireClassAdmin, editClassroom);
userClassRouter.delete("/", isLoggedIn, requireClassAdmin, deleteClassroom);

export default userClassRouter;
