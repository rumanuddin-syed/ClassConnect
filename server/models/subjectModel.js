import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attendanceRecords: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attendance" }],
  });

  const Subject = mongoose.models.Subject || mongoose.model("Subject",subjectSchema);

  export default Subject;