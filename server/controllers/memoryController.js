import { cloudinary } from '../config/cloudinaryConfig.js';
import Classroom from '../models/classroomModel.js';
import Memory from '../models/memoryModel.js';
import User from "../models/userModel.js"

const uploadToCloudinary = async (fileBuffer,className,classId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `class_memories/${className}_${classId}`},
      (error, result) => error ? reject(error) : resolve(result)
    );
    stream.end(fileBuffer);
  });
};

export const createMemory = async (req, res) => {
  try {
    const { classId, title, description } = req.body;
    const userId = req.user.id;

    const classroom = await Classroom.findById(classId);
    const isMember = classroom.members.some(m => m.user.equals(userId));
    if (!isMember && !classroom.admin.equals(userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let imageUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer,classroom.name,classId);
      imageUrl = result.secure_url;
    }

    const memory = await Memory.create({ title, description, imageUrl, creatorId: userId, classId });
    await Classroom.findByIdAndUpdate(classId, { $push: { memories: memory._id } });
    
    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editMemory = async (req, res) => {
  try {
    const { classId, Memoryid, title, description } = req.body;
    const userId = req.user.id;



    const memory = await Memory.findById(Memoryid);
    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    if (memory.creatorId.toString() !== userId && classroom.admin.toString()  !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      memory.imageUrl = result.secure_url;
    }

    memory.title = title || memory.title;
    memory.description = description || memory.description;
    await memory.save();

    res.json(memory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMemory = async (req, res) => {
  try {
    const { classId, Memoryid } = req.body;
    const userId = req.user.id;

    const memory = await Memory.findById(Memoryid);
    const classroom = await Classroom.findById(classId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }
    if (!memory) {
      return res.status(404).json({ message: "Memory not found" });
    }
    if (memory.creatorId.toString() !== userId && classroom.admin.toString()  !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }


    await Classroom.findByIdAndUpdate(classId, { $pull: { memories: Memoryid } });
    await Memory.findByIdAndDelete(Memoryid);

    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMemories = async (req, res) => {
  try {
    const { classId } = req.query;
    const userId = req.user.id;

    const classroom = await Classroom.findById(classId)
      .populate({
        path: 'memories',
        select: '_id imageUrl title description date creatorId',
        populate: { path: 'creatorId', select: 'name' }
      });

    const isAuthorized = classroom.members.some(m => m.user.equals(userId)) || classroom.admin.equals(userId);
    if (!isAuthorized) return res.status(403).json({ message: 'Not authorized' });

    res.json(classroom.memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};