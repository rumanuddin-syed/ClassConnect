import Classroom from "../models/classroomModel.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";


// 1. Add Event
export const addEvent = async (req, res) => {
  try {
    const { classId, title, date, time, description } = req.body;
    const userId = req.user.id;

    // Check if user is admin or teacher in the classroom
    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isAdmin = classroom.admin.toString() === userId;
    const isTeacher = classroom.members.some(
      (member) => member.user.toString() === userId && member.role === "teacher"
    );

    if (!isAdmin && !isTeacher) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Create new event
    const newEvent = new Event({
      creatorId: userId,
      title,
      description,
      date,
      time,
    });

    const savedEvent = await newEvent.save();

    // Add event to classroom
    classroom.events.push(savedEvent._id);
    await classroom.save();

    res.status(201).json({
      message: "Event created successfully",
      event: {
        id: savedEvent._id,
        title: savedEvent.title,
        date: savedEvent.date,
        time: savedEvent.time,
        creatorId: savedEvent.creatorId,
        description: savedEvent.description,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Edit Event
export const editEvent = async (req, res) => {
  try {
    const { classId, title, date, time, description, eventId } = req.body;
    const userId = req.user.id;

    // Check if user is admin or creator of the event
    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isAdmin = classroom.admin.toString() === userId;
    const isCreator = event.creatorId.toString() === userId;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Update event
    event.title = title || event.title;
    event.date = date || event.date;
    event.time = time || event.time;
    event.description = description || event.description;

    const updatedEvent = await event.save();

    res.status(200).json({
      message: "Event updated successfully",
      event: {
        id: updatedEvent._id,
        title: updatedEvent.title,
        date: updatedEvent.date,
        time: updatedEvent.time,
        creatorId: updatedEvent.creatorId,
        description: updatedEvent.description,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const { classId, eventId } = req.body;
    const userId = req.user.id;

    // Check if user is admin or creator of the event
    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isAdmin = classroom.admin.toString() === userId;
    const isCreator = event.creatorId.toString() === userId;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Remove event from classroom
    classroom.events = classroom.events.filter(
      (e) => e.toString() !== eventId
    );
    await classroom.save();

    // Delete event
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get Events
export const getEvents = async (req, res) => {
  try {
    const { classId } = req.query;
    const userId = req.user.id;

    // Check if user is member of the classroom
    const classroom = await Classroom.findById(classId).populate({
      path: "events",
      select: "_id title date time creatorId description",
    });

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const isMember = classroom.admin.toString() === userId || 
      classroom.members.some(member => member.user.toString() === userId);

    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Format events
    const events = classroom.events.map(event => ({
      id: event._id,
      title: event.title,
      date: event.date,
      time: event.time,
      creatorId: event.creatorId,
      description: event.description,
    }));

    res.status(200).json({ events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

