import User from '../models/userModel.js';
import Classroom from '../models/classroomModel.js'
import Subject from '../models/subjectModel.js'

export const getClassroomDetails = async (req, res) => {
  try {
    const { classroomId } = req.params;

    if (!classroomId) {
      return res.status(400).json({ message: "Classroom ID is required" });
    }

    // Find the classroom and populate necessary fields
    const classroom = await Classroom.findById(classroomId)
      .populate("admin", "name email")
      .populate({
        path: "members.user",
        select: "name email",
      })
      .populate({
        path: "subjects",
        select: "name teacher",
        populate: {
          path: "teacher",
          select: "name email",
        },
      });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    // Separate teachers and students (with emails)
    const teachers = classroom.members
      .filter((member) => member.role === "teacher")
      .map((member) => ({
        userId: member.user._id,
        name: member.user.name,
        email: member.user.email,
      }));

    const students = classroom.members
      .filter((member) => member.role === "student")
      .map((member) => ({
        userId: member.user._id,
        name: member.user.name,
        email: member.user.email,
      }));

    // Prepare subjects with assigned teacher details
    const subjects = classroom.subjects.map((subject) => ({
      subjectId: subject._id,
      name: subject.name,
      teacher: subject.teacher
        ? {
            teacherId: subject.teacher._id,
            teacherName: subject.teacher.name,
            teacherEmail: subject.teacher.email,
          }
        : null,
    }));

    // Prepare response
    const response = {
      classId: classroom._id,
      name: classroom.name,
      description: classroom.description,
      adminId: classroom.admin._id,
      adminName: classroom.admin.name,
      adminEmail: classroom.admin.email,
      teachers,
      students,
      subjects,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching classroom details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};