import Classroom from "../models/classroomModel.js";
import Subject from "../models/subjectModel.js";
import User from "../models/userModel.js";
import Attendance  from "../models/attendanceModel.js";
export const addSubject = async (req, res) => {
  try {
      const { name, teacherId, classId } = req.body;

      // Create new subject
      const newSubject = new Subject({
          name,
          classroom: classId,
          teacher: teacherId
      });

      // Save subject
      const savedSubject = await newSubject.save();

      // Add subject to classroom's subjects array and get updated classroom
      const updatedClassroom = await Classroom.findByIdAndUpdate(
          classId,
          { $push: { subjects: savedSubject._id } },
          { new: true }
      );

      // Extract student user IDs from classroom members
      const studentIds = updatedClassroom.members
          .filter(member => member.role === 'student')
          .map(member => member.user);

      // Update attendance records for all students
      if (studentIds.length > 0) {
          await User.updateMany(
              { _id: { $in: studentIds } },
              {
                  $push: {
                      attendanceRecords: {
                          class: classId,
                          subject: savedSubject._id,
                          attendedClasses: 0,
                          totalClasses: 0
                      }
                  }
              }
          );
      }

      res.status(201).json({
          success: true,
          subject: savedSubject
      });

  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message
      });
  }
};


  export const editSubject = async (req, res) => {
    try {
      const { name, teacherId, classroomId, subjectId } = req.body;
      const userId = req.user.id;
  
      // Check if user has permission (either admin or the assigned teacher)
      const classroom = await Classroom.findById(classroomId);
      
      if (classroom.admin.toString() !== userId && teacherId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized - Only class admin or assigned teacher can edit"
        });
      }
  
      // Update subject
      const updatedSubject = await Subject.findByIdAndUpdate(
        subjectId,
        { 
          name,
          teacher: teacherId 
        },
        { new: true }
      );
  
      if (!updatedSubject) {
        return res.status(404).json({
          success: false,
          message: "Subject not found"
        });
      }
  
      res.status(200).json({
        success: true,
        subject: updatedSubject
      });
  
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  };



  export const deleteSubject = async (req, res) => {
    try {
        const { classroomId, subjectId } = req.body;
        const userId = req.user.id;

        // Check permissions and fetch classroom/subject
        const classroom = await Classroom.findById(classroomId);
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found"
            });
        }

        if (classroom.admin.toString() !== userId &&
            (!subject.teacher || subject.teacher.toString() !== userId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized - Only class admin or subject teacher can delete"
            });
        }

        // Delete all attendance records associated with this subject
        if (subject.attendanceRecords.length > 0) {
            await Attendance.deleteMany({
                _id: { $in: subject.attendanceRecords }
            });
        }

        // Delete the subject document
        await Subject.findByIdAndDelete(subjectId);

        // Remove subject reference from classroom
        await Classroom.findByIdAndUpdate(
            classroomId,
            { $pull: { subjects: subjectId } }
        );

        // Extract student user IDs from classroom members
        const studentIds = classroom.members
            .filter(member => member.role === 'student')
            .map(member => member.user);

        // Remove attendance records for the subject from all students' user documents
        if (studentIds.length > 0) {
            await User.updateMany(
                { _id: { $in: studentIds } },
                {
                    $pull: {
                        attendanceRecords: {
                            class: classroomId,
                            subject: subjectId
                        }
                    }
                }
            );
        }

        res.status(200).json({
            success: true,
            message: "Subject and all associated attendance records deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};