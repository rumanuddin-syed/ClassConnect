// middleware/rbac.js
import Classroom from "../models/classroomModel.js";

/**
 * Ensures the requesting user is the admin (creator) of the classroom.
 * Looks for classroomId in req.params.classroomId, req.body.classId, or req.query.classroomId.
 */
export const requireClassAdmin = async (req, res, next) => {
  try {
    const classroomId =
      req.params.classroomId ||
      req.body.classId ||
      req.body.classroomId ||
      req.query.classroomId;

    if (!classroomId) {
      return res.status(400).json({ success: false, message: "Classroom ID is required" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    if (classroom.admin.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only the classroom admin can perform this action",
      });
    }

    req.classroom = classroom;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Authorization check failed", error: error.message });
  }
};

/**
 * Ensures the requesting user is either an admin or a member (student/teacher) of the classroom.
 */
export const requireClassMember = async (req, res, next) => {
  try {
    const classroomId =
      req.params.classroomId ||
      req.body.classId ||
      req.body.classroomId ||
      req.query.classroomId;

    if (!classroomId) {
      return res.status(400).json({ success: false, message: "Classroom ID is required" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    const userId = req.user.id.toString();
    const isAdmin = classroom.admin.toString() === userId;
    const isMember = classroom.members.some(
      (m) => (m.user?._id || m.user).toString() === userId
    );

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of this classroom",
      });
    }

    req.classroom = classroom;
    req.userClassRole = isAdmin ? "admin" : classroom.members.find((m) => (m.user?._id || m.user).toString() === userId)?.role;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Authorization check failed", error: error.message });
  }
};

/**
 * Ensures the requesting user is either the admin or a teacher in the classroom.
 */
export const requireClassTeacherOrAdmin = async (req, res, next) => {
  try {
    const classroomId =
      req.params.classroomId ||
      req.body.classId ||
      req.body.classroomId ||
      req.query.classroomId;

    if (!classroomId) {
      return res.status(400).json({ success: false, message: "Classroom ID is required" });
    }

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    const userId = req.user.id.toString();
    const isAdmin = classroom.admin.toString() === userId;
    const isTeacher = classroom.members.some(
      (m) => (m.user?._id || m.user).toString() === userId && m.role === "teacher"
    );

    if (!isAdmin && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins and teachers can perform this action",
      });
    }

    req.classroom = classroom;
    req.userClassRole = isAdmin ? "admin" : "teacher";
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Authorization check failed", error: error.message });
  }
};

