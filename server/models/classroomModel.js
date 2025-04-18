import mongoose from "mongoose";


const classroomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["teacher", "student"], required: true },
      }
    ],
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    announcements: [{ type: mongoose.Schema.Types.ObjectId, ref: "Announcement" }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    memories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Memory" }],
    joinRequests: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name:{type:String,required:true},
      role: { type: String, enum: ["teacher", "student"], required: true },
      requestedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
  });

  const Classroom = mongoose.models.Classroom || mongoose.model("Classroom", classroomSchema);


export default Classroom;