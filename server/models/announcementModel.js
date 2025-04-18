import mongoose from "mongoose";


const announcementSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    isAdmin: { type: Boolean, required: true }
  });


const Announcement = mongoose.models.Announcement || mongoose.model("Announcement",announcementSchema);

export default Announcement;