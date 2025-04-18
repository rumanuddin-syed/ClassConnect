import  Classroom from "../models/classroomModel.js";
import  User  from "../models/userModel.js";
import  Subject from "../models/subjectModel.js";
import  Attendance from "../models/attendanceModel.js";
import mongoose  from "mongoose";
// Helper function to get user role in classroom
const getUserRole = (classroom, userId) => {
  if (!classroom) return null;
  // 2. Convert IDs to strings for comparison
  const userIdStr = userId.toString();
  
  // 3. First check if user is the classroom admin
  if (classroom.admin?.toString() === userIdStr) {
    return 'admin';
  }

  // 4. Check members array (with null safety)
  const member = classroom.members?.find(m => 
    m.user._id?.toString() === userIdStr
  );
  // Return role or null (using optional chaining)
  return member?.role || null;
};


// 1. GET Attendance Data
export const getAttendanceData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { classId } = req.query;
    const userId = req.user.id;
    const classroom = await Classroom.findById(classId)
      .populate({
        path: 'members.user',
        select: '_id name'
      })
      .populate({
        path: 'subjects',
        select: '_id name teacher',
        populate: {
          path: 'teacher',
          select: '_id'
        }
      })
      .session(session);

    if (!classroom) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Classroom not found' });
    }
    const role = getUserRole(classroom, userId);
    if (!role) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Not a class member' });
    }

    let response = {};

    if (role === 'student') {
      const user = await User.findById(userId)
      .populate({
        path: 'attendanceRecords',
        populate: {
          path: 'subject',
          select: '_id name'
        }
      })
      .session(session);
  
    const filteredRecords = user.attendanceRecords.filter(record => 
      record.class && record.class.toString() === classId
    );

    const tempResponse = filteredRecords.map(record => ({
        _id: record._id,
        subject: {
          _id: record.subject._id,
          name: record.subject.name
        },
        attendedClasses: record.attendedClasses,
        totalClasses: record.totalClasses,
        percentage: Math.round((record.attendedClasses / record.totalClasses) * 100) || 0
      }));
      response={
        attendance:tempResponse,
      }
    } else {
      // Common data for teachers/admins
      const students = classroom.members
        .filter(m => m.role === 'student')
        .map(m => ({
          _id: m.user._id,
          name: m.user.name
        }));

      const subjects = classroom.subjects.filter(s => 
        role === 'teacher' ? s.teacher._id.equals(userId) : true
      );

      const attendance = await Attendance.find({
        subject: { $in: subjects.map(s => s._id) }
      })
        .populate({
          path: 'subject',
          select: '_id name'
        })
        .session(session);

      response = {
        students,
        subjects: subjects.map(s => ({
          _id: s._id,
          name: s.name,
        })),
        attendance: attendance.map(a => ({
          _id: a._id,
          subject: {
            _id: a.subject._id,
            name: a.subject.name
          },
          date: a.date,
          records: a.records.map(r => ({
            studentId: r.studentId,
            present: r.present
          }))
        }))
      };
    }

    await session.commitTransaction();
    res.json(response);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};
// 2. ADD Attendance
export const addAttendance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { classId, subjectId, date, records } = req.body;
    const userId = req.user.id;

    const [classroom, subject] = await Promise.all([
      Classroom.findById(classId),
      Subject.findById(subjectId)
    ]);

    const role = getUserRole(classroom, userId);
    if (!['admin', 'teacher'].includes(role)) throw new Error('Unauthorized');
    if (role === 'teacher' && subject.teacher.toString() !== userId) throw new Error('Unauthorized');

    // Create new attendance
    const newAttendance = await Attendance.create([{
      subject: subjectId,
      date,
      records: records.map(r => ({
        studentId: r.studentId,
        present: r.present
      }))
    }], { session });

    // Update subject's attendance records
    await Subject.findByIdAndUpdate(
      subjectId,
      { $push: { attendanceRecords: newAttendance[0]._id } },
      { session }
    );

    // Get updated subject to calculate total classes
    const updatedSubject = await Subject.findById(subjectId).session(session);
    const totalClasses = updatedSubject.attendanceRecords.length;

    // Update user attendance records
    const students = classroom.members
      .filter(m => m.role === 'student')
      .map(m => m.user.toString());

    const updateOperations = students.map(async studentId => {
      const record = records.find(r => r.studentId === studentId);
      const isPresent = record ? record.present : false;

      const user = await User.findById(studentId).session(session);
      const existingRecord = user.attendanceRecords.find(r =>
        r.class.toString() === classId && r.subject.toString() === subjectId
      );

      if (existingRecord) {
        existingRecord.attendedClasses += isPresent ? 1 : 0;
        existingRecord.totalClasses = totalClasses;
      } else {
        user.attendanceRecords.push({
          class: classId,
          subject: subjectId,
          attendedClasses: isPresent ? 1 : 0,
          totalClasses
        });
      }
      await user.save({ session });
    });

    await Promise.all(updateOperations);
    await session.commitTransaction();
    res.status(201).json(newAttendance[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// 3. EDIT Attendance
export const editAttendance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction(); // Start transaction manually
  let attendance;

  try {
    const { classId, date, records, attendanceId } = req.body;
    const userId = req.user.id;

    const [classroom, attendanceDoc] = await Promise.all([
      Classroom.findById(classId).session(session),
      Attendance.findById(attendanceId).session(session)
    ]);

    if (!classroom) throw new Error('Classroom not found');
    if (!attendanceDoc) throw new Error('Attendance record not found');

    const role = getUserRole(classroom, userId);
    if (!['admin', 'teacher'].includes(role)) throw new Error('Unauthorized');
    
    if (role === 'teacher') {
      const subject = await Subject.findById(attendanceDoc.subject).session(session);
      if (subject.teacher.toString() !== userId) throw new Error('Unauthorized');
    }

    const classroomStudentIds = classroom.members
      .filter(m => m.role === 'student')
      .map(m => m.user.toString());

    const invalidStudents = records.filter(r => 
      !classroomStudentIds.includes(r.studentId.toString())
    );
    
    if (invalidStudents.length > 0) {
      throw new Error(`Invalid students: ${invalidStudents.map(s => s.studentId)}`);
    }

    const oldRecordsMap = new Map(attendanceDoc.records.map(r => 
      [r.studentId.toString(), r.present]
    ));
    
    const newRecordsMap = new Map(records.map(r => 
      [r.studentId.toString(), r.present]
    ));

    const updates = [];
    for (const [studentId, present] of newRecordsMap) {
      const oldPresent = oldRecordsMap.get(studentId);
      if (oldPresent === undefined) {
        updates.push({ studentId, increment: present ? 1 : 0 });
      } else if (oldPresent !== present) {
        updates.push({ studentId, increment: present ? 1 : -1 });
      }
    }

    for (const [studentId, present] of oldRecordsMap) {
      if (!newRecordsMap.has(studentId) && present) {
        updates.push({ studentId, increment: -1 });
      }
    }

    for (const { studentId, increment } of updates) {
      const user = await User.findById(studentId).session(session);
      if (!user) continue;

      const recordIndex = user.attendanceRecords.findIndex(r =>
        r.class.toString() === classId && 
        r.subject.toString() === attendanceDoc.subject.toString()
      );

      if (recordIndex === -1) {
        user.attendanceRecords.push({
          class: classId,
          subject: attendanceDoc.subject,
          attendedClasses: Math.max(0, increment),
          totalClasses: 0
        });
      } else {
        user.attendanceRecords[recordIndex].attendedClasses += increment;
        user.attendanceRecords[recordIndex].attendedClasses = 
          Math.max(0, user.attendanceRecords[recordIndex].attendedClasses);
      }

      await user.save({ session });
    }

    attendanceDoc.date = date;
    attendanceDoc.records = records.map(r => ({
      studentId: r.studentId,
      present: r.present
    }));
    
    await attendanceDoc.save({ session });
    attendance = attendanceDoc;

    await session.commitTransaction(); // Manually commit
    res.json(attendance);
  } catch (error) {
    await session.abortTransaction(); // Manually abort on error
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession(); // End session
  }
};
// 4. DELETE Attendance
export const deleteAttendance = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { classId, subjectId, attendanceId } = req.body;
    const userId = req.user.id;

    const [classroom, attendance, subject] = await Promise.all([
      Classroom.findById(classId),
      Attendance.findById(attendanceId).session(session),
      Subject.findById(subjectId).session(session)
    ]);

    const role = getUserRole(classroom, userId);
    if (!['admin', 'teacher'].includes(role)) throw new Error('Unauthorized');
    if (role === 'teacher' && subject.teacher.toString() !== userId) throw new Error('Unauthorized');

    // Update user records
    const students = classroom.members
      .filter(m => m.role === 'student')
      .map(m => m.user.toString());

    const updateOperations = students.map(async studentId => {
      const user = await User.findById(studentId).session(session);
      const record = user.attendanceRecords.find(r =>
        r.class.toString() === classId && r.subject.toString() === subjectId
      );

      if (record) {
        const wasPresent = attendance.records.some(r => 
          r.studentId.toString() === studentId && r.present
        );

        if (wasPresent) {record.attendedClasses -= 1;
        record.totalClasses -= 1;}
        await user.save({ session });
      }
    });

    await Promise.all(updateOperations);

    // Remove from subject and delete
    await Subject.findByIdAndUpdate(
      subjectId,
      { $pull: { attendanceRecords: attendanceId } },
      { session }
    );
    
    await Attendance.deleteOne({ _id: attendanceId }).session(session);
    await session.commitTransaction();
    res.json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};