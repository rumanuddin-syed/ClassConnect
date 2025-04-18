import Classroom from "../models/classroomModel.js";
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js"

export const addChat = async (req, res) => {
    try {
      const { classId, message } = req.body;
      const userId = req.user.id;
  
      // Check if user is member of the classroom
      const classroom = await Classroom.findById(classId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      const user=await User.findById(userId);
      const isAdmin = classroom.admin.toString()===userId;
      const isMember = classroom.members.some(member => member.user.equals(userId));
      if (!isMember && !isAdmin) {
        return res.status(403).json({ message: "You are not a member of this classroom" });
      }
  
      // Create new chat
      const newChat = new Chat({
        sender: userId,
        message,
        fileType: "text" // Default for text messages
      });
  
      await newChat.save();
  
      // Add chat to classroom
      classroom.chats.push(newChat._id);
      await classroom.save();
      console.log(newChat);


      const formattedNewChat = {
        chatId: newChat._id,
        senderId: newChat.sender,
        senderName:user.name,
        message: newChat.message,
        timestamp: newChat.timestamp,
        isEdited: newChat.isEdited,
        isDeleted: newChat.isDeleted
      };

      req.io.to(classId).emit('new-message', formattedNewChat);

      res.status(201).json(formattedNewChat);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


export  const editChat = async (req, res) => {
    try {
      const { classId, chatSchemaId, editedMessage } = req.body;
      const userId = req.user.id;
  
      // Check if classroom exists
      const classroom = await Classroom.findById(classId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
  
      // Check if chat exists
      const chat = await Chat.findById(chatSchemaId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
  
      // Check permissions (admin or sender)
      const isAdmin = classroom.admin.equals(userId);
      const isSender = chat.sender.equals(userId);
  
      if (!isAdmin && !isSender) {
        return res.status(403).json({ message: "You don't have permission to edit this chat" });
      }
  
      // Update chat
      chat.message = editedMessage;
      chat.isEdited = true;
      await chat.save();

      const formattedEditChat = {
        chatId: chat._id,
        senderId: chat.sender._id,
        senderName: chat.sender.name,
        message: chat.message,
        timestamp: chat.timestamp,
        isEdited: chat.isEdited,
        isDeleted: chat.isDeleted
      };
      req.io.to(classId).emit('message-edited', formattedEditChat);

      res.status(200).json(formattedEditChat);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };



 export  const deleteChat = async (req, res) => {
    try {
      const { classId, chatSchemaId } = req.body;
      const userId = req.user.id;
  
      // Check if classroom exists
      const classroom = await Classroom.findById(classId);
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
      const user=await User.findById(userId);
      const userName=user.name;
      // Check if chat exists
      const chat = await Chat.findById(chatSchemaId);
      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }
  
      // Check permissions (admin or sender)
      const isAdmin = classroom.admin.equals(userId);
      const isSender = chat.sender.equals(userId);
  
      if (!isAdmin && !isSender) {
        return res.status(403).json({ message: "You don't have permission to delete this chat" });
      }
      if (!chat.isDeleted) {
        // Soft delete
        chat.isDeleted = true;
        chat.message = `This message was deleted by ${userName}`;
        await chat.save();
        const formattedDeleteChat = {
          chatId: chat._id,
          senderId: chat.sender._id,
          senderName: chat.sender.name,
          message: chat.message,
          timestamp: chat.timestamp,
          isEdited: chat.isEdited,
          isDeleted: chat.isDeleted
        };
        req.io.to(classId).emit('message-deleted', formattedDeleteChat);

        res.status(200).json(formattedDeleteChat);
      } else {
        // Hard delete
        await Chat.findByIdAndDelete(chatSchemaId);
        
        // Remove from classroom chats array
        classroom.chats = classroom.chats.filter(chatId => !chatId.equals(chatSchemaId));
        await classroom.save();
        req.io.to(classId).emit('message-removed', chatSchemaId);

        res.status(200).json(chatSchemaId);
      }
  
      
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


 export  const getChats = async (req, res) => {
    try {
      const { classId } = req.query;
      const userId = req.user.id;
  
      // Check if classroom exists
      const classroom = await Classroom.findById(classId)
        .populate({
          path: 'chats',
          populate: {
            path: 'sender',
            select: 'name'
          }
        });
  
      if (!classroom) {
        return res.status(404).json({ message: "Classroom not found" });
      }
  
      // Check if user is member or admin
      const isAdmin = classroom.admin.equals(userId);
      const isMember = classroom.members.some(member => member.user.equals(userId));
  
      if (!isAdmin && !isMember) {
        return res.status(403).json({ message: "You don't have access to this classroom" });
      }
  
      // Format response
      const formattedChats = classroom.chats.map(chat => ({
        chatId: chat._id,
        senderId: chat.sender._id,
        senderName: chat.sender.name,
        message: chat.message,
        timestamp: chat.timestamp,
        isEdited: chat.isEdited,
        isDeleted: chat.isDeleted
      }));
  
      // Sort by timestamp (newest first)
      formattedChats.sort((a, b) => a.timestamp - b.timestamp);
  
      res.status(200).json(formattedChats);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };