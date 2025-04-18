import  Announcement from "../models/announcementModel.js";
import Classroom from "../models/classroomModel.js";

export const addAnnouncement = async (req, res) => {
    try {
      const { text, classId } = req.body;
      const userId = req.user.id; // From middleware
  
      // Check if user is admin or teacher in this classroom
      const classroom = await Classroom.findById(classId);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
  
      const isAdmin = classroom.admin.toString() === userId.toString();
      const isTeacher = classroom.members.some(
        member => member.user.toString() === userId.toString() && member.role === 'teacher'
      );
  
      if (!isAdmin && !isTeacher) {
        return res.status(403).json({ message: 'Only admins and teachers can create announcements' });
      }
  
      // Create new announcement
      const newAnnouncement = new Announcement({
        text,
        author: userId,
        date: Date.now(),
        isAdmin
      });
  
      const savedAnnouncement = await newAnnouncement.save();
  
      // Add announcement to classroom
      classroom.announcements.push(savedAnnouncement._id);
      await classroom.save();
  
      res.status(201).json({
        message: 'Announcement created successfully',
        announcement: savedAnnouncement
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };


 export  const editAnnouncement = async (req, res) => {
    try {
      const { announcementId, classroomId, text } = req.body;
      const userId = req.user.id;
  
      // Find the announcement
      const announcement = await Announcement.findById(announcementId);
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }
  
      // Check if user is admin or author
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
  
      const isAdmin = classroom.admin.toString() === userId.toString();
      const isAuthor = announcement.author.toString() === userId.toString();
  
      if (!isAdmin && !isAuthor) {
        return res.status(403).json({ message: 'Not authorized to edit this announcement' });
      }
  
      // Update the announcement
      announcement.text = text;
      const updatedAnnouncement = await announcement.save();
  
      res.status(200).json({
        message: 'Announcement updated successfully',
        announcement: updatedAnnouncement
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };



 export const deleteAnnouncement = async (req, res) => {
    try {
      const { announcementId, classroomId } = req.body;
      const userId = req.user.id;
  
      // Find the announcement
      const announcement = await Announcement.findById(announcementId);
      if (!announcement) {
        return res.status(404).json({ message: 'Announcement not found' });
      }
  
      // Check if user is admin or author
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
  
      const isAdmin = classroom.admin.toString() === userId.toString();
      const isAuthor = announcement.author.toString() === userId.toString();
  
      if (!isAdmin && !isAuthor) {
        return res.status(403).json({ message: 'Not authorized to delete this announcement' });
      }
  
      // Remove announcement from classroom array
      classroom.announcements = classroom.announcements.filter(
        annId => annId.toString() !== announcementId
      );
      await classroom.save();
  
      // Delete the announcement document
      await Announcement.findByIdAndDelete(announcementId);
  
      res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };



 export const getAnnouncements = async (req, res) => {
    try {
      const { classroomId } = req.params;
  
      const classroom = await Classroom.findById(classroomId)
        .populate({
          path: 'announcements',
          populate: {
            path: 'author',
            select: 'name' // Only get the name of the author
          }
        })
        .select('announcements');
  
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
  
      // Format the response
      const announcements = classroom.announcements.map(announcement => ({
        id: announcement._id,
        text: announcement.text,
        authorName: announcement.author.name,
        date: announcement.date,
        isAdmin: announcement.isAdmin
      }));
  
      res.status(200).json({ announcements });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };