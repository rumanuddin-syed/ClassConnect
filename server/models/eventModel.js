import mongoose from "mongoose";


const eventSchema = new mongoose.Schema({
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true },  // Format: "YYYY-MM-DD"
    time: { type: String, required: true }, // Format: "HH:MM"
  });
  
  const Event = mongoose.models.Event || mongoose.model("Event",eventSchema);
  export default Event;