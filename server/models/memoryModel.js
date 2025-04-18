import mongoose from "mongoose";


const memorySchema = new mongoose.Schema({
    title: { type: String },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" ,required:true},
    imageUrl: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
  });


const Memory = mongoose.models.Memory || mongoose.model("Memory",memorySchema);

export default Memory;