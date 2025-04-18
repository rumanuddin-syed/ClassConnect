import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String },
    fileUrl: { type: String },
    fileType: { type: String, enum: ["text", "image", "pdf", "document"], required: true },
    timestamp: { type: Date, default: Date.now },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  });

  
  const Chat = mongoose.models.Chat || mongoose.model("Chat",chatSchema);

  export default Chat;