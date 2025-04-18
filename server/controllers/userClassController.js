import User from '../models/userModel.js';
import Classroom from '../models/classroomModel.js'
import Subject from '../models/subjectModel.js';
import Memory from "../models/memoryModel.js";
import Chat from "../models/chatModel.js";
import Attendance from "../models/attendanceModel.js";
import Announcement from "../models/announcementModel.js";
import Event from "../models/eventModel.js";
import mongoose from "mongoose";


export const getUserClasses = async (req, res) => {
  try {
    const  userId  = req.user.id; // Get user ID from request params

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    // Find the user and populate createdClasses & joinedClasses with only required fields
    const user = await User.findById(userId)
      .populate({
        path: "createdClasses",
        select: "name description admin", // Select required fields
        populate: { path: "admin", select: "name" }, // Populate only admin name
      })
      .populate({
        path: "joinedClasses",
        select: "name description admin", // Select required fields
        populate: { path: "admin", select: "name" }, // Populate only admin name
      });

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format response with only required fields
    const createdClasses = user.createdClasses.map((cls) => ({
      classId: cls._id,
      className: cls.name,
      classDescription: cls.description,
      adminName: cls.admin?.name || "Unknown", // Handle case where admin is missing
    }));

    const joinedClasses = user.joinedClasses.map((cls) => ({
      classId: cls._id,
      className: cls.name,
      classDescription: cls.description,
      adminName: cls.admin?.name || "Unknown",
    }));
    // Send the response
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        createdClasses,
        joinedClasses,
      },
    });
  } catch (error) {
    console.error("Error fetching user classes:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const createUserClass = async (req, res) => {
  try {
      const  userId  = req.user.id;
      const {  name, description } = req.body;
      
      // Validate required fields
      if (!userId || !name) {
          return res.status(400).json({ message: "User ID and class name are required." });
      }
      
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found." });
      }
      
      // Create the classroom
      const newClassroom = new Classroom({
          name,
          description,
          admin: userId,
      });
      
      // Save the classroom
      const savedClassroom = await newClassroom.save();
      
      // Update the user's createdClasses array
      user.createdClasses.push(savedClassroom._id);
      await user.save();
      
      res.status(201).json({ message: "Classroom created successfully", classroom: savedClassroom });
  } catch (error) {
      console.error("Error creating classroom:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};



export const reqJoinClass = async (req, res) => {
  try {
      const  userId  = req.user.id;
      const {  classId, role } = req.body;
      
      // Validate required fields
      if (!userId || !classId || !role) {
          return res.status(400).json({ message: "User ID, Class ID, and role are required." });
      }
      
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "User not found." });
      }
      
      // Find the classroom
      const classroom = await Classroom.findById(classId);
      if (!classroom) {
          return res.status(404).json({ message: "Classroom not found." });
      }
      
      if(classroom.admin.toString()===userId){
        return res.status(400).json({ message: "You are already admin of this class" });
      }
      
      // Check if user is already a member
      const isMember = classroom.members.some(member => member.user.toString() === userId);
      if (isMember) {
          return res.status(400).json({ message: "You are already a member of this class." });
      }

      // Check if the user has already requested to join
      const existingRequest = classroom.joinRequests.some(request => request.user.toString() === userId);
      if (existingRequest) {
          return res.status(400).json({ message: "Join request already exists." });
      }
      
      // Add the join request
      classroom.joinRequests.push({ user: userId,name:user.name, role, requestedAt: new Date() });
      await classroom.save();
      
      res.status(200).json({ message: "Join request sent successfully.", classroom });
  } catch (error) {
      console.error("Error requesting to join class:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};


export const removeMember = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    // 1. Validate input parameters
    const { classId, userId } = req.body;
    if (!classId || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 2. Validate ObjectID formats
    if (!mongoose.isValidObjectId(classId) || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const currUserId = req.user.id;

    // 3. Get classroom with proper session handling
    const classroom = await Classroom.findById(classId)
      .session(session)
      .populate('subjects', 'teacher')
      .select('admin members subjects');

    if (!classroom) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // 4. Authorization checks
    if (classroom.admin.toString() !== currUserId) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (classroom.admin.toString() === userId) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot remove classroom admin' });
    }

    // 5. Find member in classroom
    const memberIndex = classroom.members.findIndex(
      m => m.user.toString() === userId
    );

    if (memberIndex === -1) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'User not found in classroom' });
    }

    const member = classroom.members[memberIndex];

    // 6. Verify user exists before update
    const userExists = await User.exists({ _id: userId }).session(session);
    if (!userExists) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'User not found' });
    }

    // 7. Remove from user's joined classes
    await User.findByIdAndUpdate(
      userId,
      { $pull: { joinedClasses: classId } },
      { session }
    );

    // 8. Handle teacher-specific cleanup with error handling
    if (member.role === "teacher") {
      try {
        const subjectUpdates = classroom.subjects.map(subject => {
          if (subject.teacher?.toString() === userId) {
            return Subject.findByIdAndUpdate(
              subject._id,
              { $unset: { teacher: 1 } },
              { session, new: true }
            );
          }
          return Promise.resolve();
        });

        await Promise.all(subjectUpdates);
      } catch (subjectError) {
        await session.abortTransaction();
        return res.status(500).json({
          message: 'Failed to update subjects',
          error: subjectError.message
        });
      }
    }

    // 9. Update classroom members
    classroom.members.splice(memberIndex, 1);
    await classroom.save({ session });

    // 11. Commit transaction
    await session.commitTransaction();
    
    res.json({ message: 'Member removed successfully' });

  } catch (error) {
    await session.abortTransaction();
    console.error('Remove Member Error:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user
    });
    
    res.status(500).json({ 
      message: 'Internal server error during member removal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};



// 1) Edit Classroom Controller
export const editClassroom = async (req, res) => {
  try {
    const { classId, name, description } = req.body;
    const userId = req.user.id;

    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    // Authorization check
    if (classroom.admin.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Update classroom details
    const updatedClass = await Classroom.findByIdAndUpdate(
      classId,
      { $set: { name, description } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Classroom updated successfully",
      classroom: updatedClass
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2) Delete Classroom Controller
export const deleteClassroom = async (req, res) => {
  try {
    const { classId } = req.body;
    const userId = req.user.id;

    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ success: false, message: "Classroom not found" });
    }

    // Authorization check
    if (classroom.admin.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Remove class from admin's createdClasses
    await User.findByIdAndUpdate(userId, {
      $pull: { createdClasses: classId }
    });

    // Remove class from all members' joinedClasses
    const memberIds = classroom.members.map(m => m.user.toString());
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { joinedClasses: classId } }
    );

    // Delete all related data
    await Promise.all([
      // Delete subjects and their attendance records
      ...classroom.subjects.map(async subjectId => {
        await Attendance.deleteMany({ subject: subjectId });
        await Subject.findByIdAndDelete(subjectId);
      }),
      
      // Delete chats
      Chat.deleteMany({ _id: { $in: classroom.chats } }),
      
      // Delete announcements
      Announcement.deleteMany({ _id: { $in: classroom.announcements } }),
      
      // Delete events
      Event.deleteMany({ _id: { $in: classroom.events } }),
      
      // Delete memories
      Memory.deleteMany({ _id: { $in: classroom.memories } })
    ]);

    // Finally delete the classroom
    await Classroom.findByIdAndDelete(classId);

    res.status(200).json({
      success: true,
      message: "Classroom and all related data deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};